import type { LoadError } from "@app/lib/router/definitions";
import type {
  BaseUrl,
  Blob,
  Commit,
  CommitHeader,
  Issue,
  Patch,
  Project,
  Remote,
  Tree,
} from "@httpd-client";

import { get } from "svelte/store";

import { HttpdClient } from "@httpd-client";
import { activeRouteStore, push, replace, routeToPath } from "@app/lib/router";
import * as Syntax from "@app/lib/syntax";
import { unreachable } from "@app/lib/utils";
import { seedPath } from "@app/views/seeds/router";

export const COMMITS_PER_PAGE = 30;

export interface ProjectRoute {
  resource: "projects";
  params: ProjectsParams;
}

export interface ProjectLoadedRoute {
  resource: "projects";
  params: ProjectLoadedParams;
}

export interface ProjectsParams {
  baseUrl: BaseUrl;
  id: string;
  view:
    | { resource: "tree" }
    | { resource: "commits"; commitId: string }
    | { resource: "history" }
    | { resource: "issue"; params: { issue: string } }
    | {
        resource: "issues";
        params: {
          view: { resource: "new" | "list" };
          search?: string;
        };
      }
    | {
        resource: "patches";
        params: {
          view: { resource: "list" };
          search?: string;
        };
      }
    | {
        resource: "patch";
        params: { patch: string; revision?: string; search?: string };
      };

  hash?: string;
  path?: string;
  peer?: string;
  revision?: string;
  route?: string;
}

export interface ProjectLoadedParams {
  baseUrl: BaseUrl;
  id: string;
  project: Project;
  view: ProjectLoadedView;

  hash?: string;
  peer?: string;
  revision?: string;
}

interface LoadedSourceBrowsingParams {
  loadedBranches: Record<string, string> | undefined;
  loadedPeers: Remote[];
  loadedTree: Tree;
  selectedCommit: string;
}

export type BlobResult =
  | { ok: true; blob: Blob; highlighted: Syntax.Root | undefined }
  | { ok: false; error: { message: string; path: string } };

export type LoadedSourceBrowsingView =
  | {
      resource: "tree";
      params: LoadedSourceBrowsingParams;
      path: string;
      blobResult: BlobResult;
    }
  | {
      resource: "commits";
      params: LoadedSourceBrowsingParams;
      // FIXME: We need the ID so that `updateProjectRoute()` type checks.
      commitId: string;
      commit: Commit;
    }
  | {
      resource: "history";
      params: LoadedSourceBrowsingParams;
      commitHeaders: CommitHeader[];
      totalCommitCount: number;
    };

export type ProjectLoadedView =
  | LoadedSourceBrowsingView
  | { resource: "issue"; params: { issue: string; loadedIssue: Issue } }
  | {
      resource: "issues";
      params: {
        view: { resource: "new" | "list" };
        search: string;
      };
    }
  | {
      resource: "patches";
      params: {
        view: { resource: "list" };
        search: string;
      };
    }
  | {
      resource: "patch";
      params: {
        patch: string;
        revision?: string;
        loadedPatch: Patch;

        search: string;
      };
    };

// Check whether the input is a SHA1 commit.
function isOid(input: string): boolean {
  return /^[a-fA-F0-9]{40}$/.test(input);
}

export function parseRevisionToOid(
  revision: string | undefined,
  defaultBranch: string,
  branches: Record<string, string>,
): string {
  if (revision) {
    if (isOid(revision)) {
      return revision;
    } else {
      const oid = branches[revision];
      if (oid) {
        return oid;
      } else {
        throw new Error(`Revision ${revision} not found`);
      }
    }
  } else {
    return branches[defaultBranch];
  }
}

export async function loadProjectRoute(
  params: ProjectsParams,
): Promise<ProjectLoadedRoute | LoadError> {
  const api = new HttpdClient(params.baseUrl);
  try {
    if (params.view.resource === "tree" || params.view.resource === "history") {
      const projectPromise = api.project.getById(params.id);
      const peersPromise = api.project.getAllRemotes(params.id);
      const branchesPromise = (async () => {
        if (params.peer) {
          return (await api.project.getRemoteByPeer(params.id, params.peer))
            .heads;
        } else {
          return undefined;
        }
      })();

      const [project, peers, branches] = await Promise.all([
        projectPromise,
        peersPromise,
        branchesPromise,
      ]);

      if (params.route) {
        const { revision, path } = detectRevision(
          params.route,
          branches || { [project.defaultBranch]: project.head },
        );
        params.revision = revision;
        params.path = path;
        // TODO Do not mutate `params`. Contruct a new `loadedParams` object
        // instead.
        delete params.route;
      }

      const commit = parseRevisionToOid(
        params.revision,
        project.defaultBranch,
        branches || { [project.defaultBranch]: project.head },
      );
      const tree = await api.project.getTree(params.id, commit);
      const viewParams = {
        loadedBranches: branches,
        loadedPeers: peers,
        loadedTree: tree,
        selectedCommit: commit,
      };
      if (params.view.resource === "tree") {
        let blobResult: BlobResult;

        const path = params.path || "/";
        try {
          let blob: Blob;
          if (path === "/") {
            blob = await api.project.getReadme(project.id, commit);
          } else {
            blob = await api.project.getBlob(project.id, commit, path);
          }
          blobResult = {
            ok: true,
            blob,
            highlighted: blob.content
              ? await Syntax.highlight(
                  blob.content,
                  blob.path.split(".").pop() ?? "",
                )
              : undefined,
          };
        } catch {
          if (path === "/") {
            blobResult = {
              ok: false,
              error: {
                message: "The README could not be loaded",
                path,
              },
            };
          } else {
            blobResult = {
              ok: false,
              error: {
                message: "Not able to load file",
                path,
              },
            };
          }
        }

        return {
          resource: "projects",
          params: {
            ...params,
            project,
            view: {
              resource: params.view.resource,
              params: viewParams,
              path,
              blobResult,
            },
          },
        };
      } else if (params.view.resource === "history") {
        const commitsResponse = await api.project.getAllCommits(project.id, {
          parent: commit,
          page: 0,
          perPage: COMMITS_PER_PAGE,
        });

        return {
          resource: "projects",
          params: {
            ...params,
            project,
            view: {
              resource: params.view.resource,
              params: viewParams,
              commitHeaders: commitsResponse.commits.map(c => c.commit),
              totalCommitCount: commitsResponse.stats.commits,
            },
          },
        };
      } else {
        return params.view;
      }
    } else if (params.view.resource === "commits") {
      const projectPromise = api.project.getById(params.id);
      const peersPromise = api.project.getAllRemotes(params.id);

      const [project, peers] = await Promise.all([
        projectPromise,
        peersPromise,
      ]);

      const tree = await api.project.getTree(params.id, params.view.commitId);
      const viewParams = {
        loadedBranches: undefined,
        loadedPeers: peers,
        loadedTree: tree,
        selectedCommit: params.view.commitId,
      };
      const loadedCommit = await api.project.getCommitBySha(
        params.id,
        params.view.commitId,
      );

      return {
        resource: "projects",
        params: {
          ...params,
          revision: params.view.commitId,
          project,
          view: {
            resource: params.view.resource,
            params: viewParams,
            commitId: params.view.commitId,
            commit: loadedCommit,
          },
        },
      };
    } else if (params.view.resource === "issue") {
      try {
        const projectPromise = api.project.getById(params.id);
        const issuePromise = api.project.getIssueById(
          params.id,
          params.view.params.issue,
        );
        const [project, issue] = await Promise.all([
          projectPromise,
          issuePromise,
        ]);
        return {
          resource: "projects",
          params: {
            ...params,
            project,
            view: {
              resource: "issue",
              params: { ...params.view.params, loadedIssue: issue },
            },
          },
        };
      } catch (error: any) {
        return {
          resource: "loadError",
          params: {
            title: params.view.params.issue,
            errorMessage: "Not able to load this issue.",
            stackTrace: error.stack,
          },
        };
      }
    } else if (params.view.resource === "patch") {
      try {
        const projectPromise = api.project.getById(params.id);
        const patchPromise = api.project.getPatchById(
          params.id,
          params.view.params.patch,
        );
        const [project, patch] = await Promise.all([
          projectPromise,
          patchPromise,
        ]);
        return {
          resource: "projects",
          params: {
            ...params,
            project,
            view: {
              resource: "patch",
              params: {
                search: "",
                ...params.view.params,
                loadedPatch: patch,
              },
            },
          },
        };
      } catch (error: any) {
        return {
          resource: "loadError",
          params: {
            title: params.view.params.patch,
            errorMessage: "Not able to load this patch.",
            stackTrace: error.stack,
          },
        };
      }
    } else if (params.view.resource === "issues") {
      const project = await api.project.getById(params.id);
      return {
        resource: "projects",
        params: {
          ...params,
          view: {
            resource: "issues",
            params: { search: "", ...params.view.params },
          },
          project,
        },
      };
    } else if (params.view.resource === "patches") {
      const project = await api.project.getById(params.id);
      return {
        resource: "projects",
        params: {
          ...params,
          view: {
            resource: "patches",
            params: { search: "", ...params.view.params },
          },
          project,
        },
      };
    } else {
      return unreachable(params.view);
    }
  } catch (error: any) {
    return {
      resource: "loadError",
      params: {
        title: params.id,
        errorMessage: "Not able to load this project.",
        stackTrace: error.stack,
      },
    };
  }
}

// Detects branch names and commit IDs at the start of `input` and extract it.
function detectRevision(
  input: string,
  branches: Record<string, string>,
): { path: string; revision?: string } {
  const commitPath = [input.slice(0, 40), input.slice(41)];
  const branch = Object.entries(branches).find(([branchName]) =>
    input.startsWith(branchName),
  );

  if (branch) {
    const [revision, path] = [
      input.slice(0, branch[0].length),
      input.slice(branch[0].length + 1),
    ];
    return {
      revision,
      path: path || "/",
    };
  } else if (isOid(commitPath[0])) {
    return {
      revision: commitPath[0],
      path: commitPath[1] || "/",
    };
  } else {
    return { path: input };
  }
}

function sanitizeQueryString(queryString: string): string {
  return queryString.startsWith("?") ? queryString.substring(1) : queryString;
}

export function createProjectRoute(
  activeRoute: ProjectRoute,
  projectRouteParams: Partial<ProjectsParams>,
): ProjectRoute {
  return {
    resource: "projects",
    params: {
      ...activeRoute.params,
      hash: undefined,
      ...projectRouteParams,
    },
  };
}

export function projectLinkHref(
  projectRouteParams: Partial<Omit<ProjectsParams, "id" | "route" | "hash">>,
): string | undefined {
  const activeRoute = get(activeRouteStore);

  if (activeRoute.resource === "projects") {
    return routeToPath(createProjectRoute(activeRoute, projectRouteParams));
  } else {
    throw new Error(
      "Don't use project specific navigation outside of project views",
    );
  }
}

export async function updateProjectRoute(
  projectRouteParams: Partial<Omit<ProjectsParams, "id" | "route" | "hash">>,
  opts: { replace: boolean } = { replace: false },
): Promise<void> {
  const activeRoute = get(activeRouteStore);

  if (activeRoute.resource === "projects") {
    const updatedRoute = createProjectRoute(activeRoute, projectRouteParams);
    if (opts.replace) {
      await replace(updatedRoute);
    } else {
      await push(updatedRoute);
    }
  } else {
    throw new Error(
      "Don't use project specific navigation outside of project views",
    );
  }
}

export function resolveProjectRoute(
  url: URL,
  baseUrl: BaseUrl,
  id: string,
  segments: string[],
): ProjectsParams | null {
  let content = segments.shift();
  let peer;
  if (content === "remotes") {
    peer = segments.shift();
    content = segments.shift();
  }

  if (!content || content === "tree") {
    const hash = url.href.match(/#{1}[^#.]+$/)?.pop();
    return {
      view: { resource: "tree" },
      baseUrl,
      id,
      peer,
      path: undefined,
      revision: undefined,
      hash: hash?.substring(1),
      route: segments.join("/"),
    };
  } else if (content === "history") {
    return {
      view: { resource: "history" },
      baseUrl,
      id,
      peer,
      path: undefined,
      revision: undefined,
      route: segments.join("/"),
    };
  } else if (content === "commits") {
    return {
      view: { resource: "commits", commitId: segments[0] },
      baseUrl,
      id,
      peer,
      path: undefined,
      revision: undefined,
      route: undefined,
    };
  } else if (content === "issues") {
    const issueOrAction = segments.shift();
    if (issueOrAction === "new") {
      return {
        view: {
          resource: "issues",
          params: {
            view: { resource: "new" },
            search: sanitizeQueryString(url.search),
          },
        },
        baseUrl,
        id,
        peer,
        path: undefined,
        revision: undefined,
      };
    } else if (issueOrAction) {
      return {
        view: { resource: "issue", params: { issue: issueOrAction } },
        baseUrl,
        id,
        peer,
        path: undefined,
        revision: undefined,
      };
    } else {
      return {
        view: {
          resource: "issues",
          params: {
            view: { resource: "list" },
            search: sanitizeQueryString(url.search),
          },
        },
        baseUrl,
        id,
        peer,
        path: undefined,
        revision: undefined,
      };
    }
  } else if (content === "patches") {
    const patch = segments.shift();
    const revision = segments.shift();
    if (patch) {
      return {
        view: {
          resource: "patch",
          params: { patch, revision, search: sanitizeQueryString(url.search) },
        },
        baseUrl,
        id,
        peer,
        path: undefined,
        revision: undefined,
      };
    } else {
      return {
        view: {
          resource: "patches",
          params: {
            view: { resource: "list" },
            search: sanitizeQueryString(url.search),
          },
        },
        baseUrl,
        id,
        peer,
        path: undefined,
        revision: undefined,
      };
    }
  }

  return null;
}

export function projectRouteToPath(params: ProjectsParams): string {
  const seed = seedPath(params.baseUrl);
  const content = `/${params.view.resource}`;

  let peer = "";
  if (params.peer) {
    peer = `/remotes/${params.peer}`;
  }

  let suffix = "";
  if (params.route) {
    suffix = `/${params.route}`;
  } else {
    if (
      (params.view.resource === "tree" || params.view.resource === "history") &&
      params.revision
    ) {
      suffix = `/${params.revision}`;
    }
    if (params.path && params.path !== "/") {
      suffix += `/${params.path}`;
    }
  }

  if (params.hash) {
    suffix += `#${params.hash}`;
  }

  if (params.view.resource === "tree") {
    if (suffix) {
      return `${seed}/${params.id}${peer}/tree${suffix}`;
    }
    return `${seed}/${params.id}${peer}`;
  } else if (params.view.resource === "commits") {
    return `${seed}/${params.id}${peer}/commits/${params.view.commitId}`;
  } else if (params.view.resource === "history") {
    return `${seed}/${params.id}${peer}/history${suffix}`;
  } else if (
    params.view.resource === "issues" &&
    params.view.params?.view.resource === "new"
  ) {
    return `${seed}/${params.id}${peer}/issues/new${suffix}`;
  } else if (params.view.resource === "issues") {
    if (params.view.params.search) {
      suffix += `?${params.view.params.search}`;
    }
    return `${seed}/${params.id}${peer}/issues${suffix}`;
  } else if (params.view.resource === "issue") {
    return `${seed}/${params.id}${peer}/issues/${params.view.params.issue}`;
  } else if (params.view.resource === "patches") {
    if (params.view.params.search) {
      suffix += `?${params.view.params.search}`;
    }
    return `${seed}/${params.id}${peer}/patches${suffix}`;
  } else if (params.view.resource === "patch") {
    if (params.view.params.search) {
      suffix += `?${params.view.params.search}`;
    }
    if (params.view.params.revision) {
      return `${seed}/${params.id}${peer}/patches/${params.view.params.patch}/${params.view.params.revision}${suffix}`;
    }
    return `${seed}/${params.id}${peer}/patches/${params.view.params.patch}${suffix}`;
  } else {
    return `${seed}/${params.id}${peer}${content}`;
  }
}

export const testExports = { isOid };
