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

import { HttpdClient } from "@httpd-client";
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
}

interface LoadedSourceBrowsingParams {
  loadedBranches: Record<string, string> | undefined;
  loadedPeers: Remote[];
  loadedTree: Tree;
}

export type BlobResult =
  | { ok: true; blob: Blob; highlighted: Syntax.Root | undefined }
  | { ok: false; error: { message: string; path: string } };

export type LoadedSourceBrowsingView =
  | {
      resource: "tree";
      peer: string | undefined;
      revision: string | undefined;
      params: LoadedSourceBrowsingParams;
      path: string;
      blobResult: BlobResult;
    }
  | {
      resource: "commits";
      params: LoadedSourceBrowsingParams;
      commit: Commit;
    }
  | {
      resource: "history";
      peer: string | undefined;
      revision: string | undefined;
      params: LoadedSourceBrowsingParams;
      commitHeaders: CommitHeader[];
      totalCommitCount: number;
    };

export type ProjectLoadedView =
  | LoadedSourceBrowsingView
  | { resource: "issue"; issue: Issue }
  | { resource: "issues"; search: string }
  | { resource: "newIssue" }
  | { resource: "patches"; search: string }
  | {
      resource: "patch";
      patch: Patch;
      revision?: string;
      search: string;
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
            id: params.id,
            baseUrl: params.baseUrl,
            project,
            view: {
              resource: "tree",
              peer: params.peer,
              revision: params.revision,
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
            id: params.id,
            baseUrl: params.baseUrl,
            project,
            view: {
              resource: "history",
              peer: params.peer,
              revision: params.revision,
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
      };
      const loadedCommit = await api.project.getCommitBySha(
        params.id,
        params.view.commitId,
      );

      return {
        resource: "projects",
        params: {
          id: params.id,
          baseUrl: params.baseUrl,
          project,
          view: {
            resource: "commits",
            params: viewParams,
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
            id: params.id,
            baseUrl: params.baseUrl,
            project,
            view: {
              resource: "issue",
              issue,
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
            id: params.id,
            baseUrl: params.baseUrl,
            project,
            view: {
              resource: "patch",
              search: params.view.params.search || "",
              patch: patch,
              revision: params.view.params.revision,
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
      if (params.view.params.view.resource === "list") {
        return {
          resource: "projects",
          params: {
            id: params.id,
            baseUrl: params.baseUrl,
            view: {
              resource: "issues",
              search: params.view.params.search || "",
            },
            project,
          },
        };
      } else if (params.view.params.view.resource === "new") {
        return {
          resource: "projects",
          params: {
            ...params,
            view: {
              resource: "newIssue",
            },
            project,
          },
        };
      } else {
        return unreachable(params.view.params.view.resource);
      }
    } else if (params.view.resource === "patches") {
      const project = await api.project.getById(params.id);
      return {
        resource: "projects",
        params: {
          id: params.id,
          baseUrl: params.baseUrl,
          view: {
            resource: "patches",
            search: params.view.params.search || "",
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

export function resolveProjectRoute(
  baseUrl: BaseUrl,
  id: string,
  segments: string[],
  urlSearch: string,
): ProjectsParams | null {
  let content = segments.shift();
  let peer;
  if (content === "remotes") {
    peer = segments.shift();
    content = segments.shift();
  }

  if (!content || content === "tree") {
    return {
      view: { resource: "tree" },
      baseUrl,
      id,
      peer,
      path: undefined,
      revision: undefined,
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
            search: sanitizeQueryString(urlSearch),
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
            search: sanitizeQueryString(urlSearch),
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
          params: { patch, revision, search: sanitizeQueryString(urlSearch) },
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
            search: sanitizeQueryString(urlSearch),
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

  const pathSegments = [seed, params.id];

  if (params.peer) {
    pathSegments.push("remotes", params.peer);
  }

  if (params.view.resource === "tree" || params.view.resource === "history") {
    pathSegments.push(params.view.resource);
    let omitTree = true;

    if (params.route && params.route !== "/") {
      pathSegments.push(params.route);
      omitTree = false;
    } else {
      if (params.revision) {
        pathSegments.push(params.revision);
        omitTree = false;
      }

      if (params.path && params.path !== "/") {
        pathSegments.push(params.path);
        omitTree = false;
      }
    }
    if (params.view.resource === "tree" && omitTree) {
      pathSegments.pop();
    }

    return pathSegments.join("/");
  } else if (params.view.resource === "commits") {
    return [...pathSegments, "commits", params.view.commitId].join("/");
  } else if (
    params.view.resource === "issues" &&
    params.view.params?.view.resource === "new"
  ) {
    return [...pathSegments, "issues", "new"].join("/");
  } else if (params.view.resource === "issues") {
    let url = [...pathSegments, "issues"].join("/");
    if (params.view.params.search) {
      url += `?${params.view.params.search}`;
    }
    return url;
  } else if (params.view.resource === "issue") {
    return [...pathSegments, "issues", params.view.params.issue].join("/");
  } else if (params.view.resource === "patches") {
    let url = [...pathSegments, "patches"].join("/");
    if (params.view.params.search) {
      url += `?${params.view.params.search}`;
    }
    return url;
  } else if (params.view.resource === "patch") {
    pathSegments.push("patches", params.view.params.patch);
    if (params.view.params.revision) {
      pathSegments.push(params.view.params.revision);
    }

    let url = pathSegments.join("/");
    if (params.view.params.search) {
      url += `?${params.view.params.search}`;
    }
    return url;
  } else {
    return unreachable(params.view);
  }
}

export const testExports = { isOid };
