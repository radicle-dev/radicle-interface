import type { LoadError } from "@app/lib/router/definitions";
import type { Project, Remote, Tree } from "@httpd-client";

import { get } from "svelte/store";

import { HttpdClient } from "@httpd-client";
import { activeRouteStore, push, replace, routeToPath } from "@app/lib/router";
import { extractBaseUrl } from "@app/lib/utils";

export interface ProjectRoute {
  resource: "projects";
  params: ProjectsParams;
}

export interface ProjectLoadedRoute {
  resource: "projects";
  params: ProjectLoadedParams;
}

export interface ProjectsParams {
  id: string;
  hash?: string;
  hostnamePort: string;
  path?: string;
  peer?: string;
  revision?: string;
  route?: string;
  search?: string;
  view:
    | { resource: "tree" }
    | { resource: "commits" }
    | { resource: "history" }
    | { resource: "issue"; params: { issue: string } }
    | {
        resource: "issues";
        params?: {
          view: { resource: "new" };
        };
      }
    | {
        resource: "patches";
        params?: {
          view: { resource: "new" };
        };
      }
    | { resource: "patch"; params: { patch: string; revision?: string } };
}

export interface ProjectLoadedParams {
  hostnamePort: string;
  id: string;
  project: Project;
  view: ProjectLoadedView;

  hash?: string;
  path?: string;
  peer?: string;
  revision?: string;
  search?: string;
}

interface LoadedSourceBrowsingParams {
  loadedBranches: Record<string, string>;
  loadedPeers: Remote[];
  loadedTree: Tree;
  selectedCommit: string;
}

export type ProjectLoadedView =
  | {
      resource: "tree";
      params: LoadedSourceBrowsingParams;
    }
  | {
      resource: "commits";
      params: LoadedSourceBrowsingParams;
    }
  | {
      resource: "history";
      params: LoadedSourceBrowsingParams;
    }
  | { resource: "issue"; params: { issue: string } }
  | {
      resource: "issues";
      params?: {
        view: { resource: "new" };
      };
    }
  | {
      resource: "patches";
      params?: {
        view: { resource: "new" };
      };
    }
  | { resource: "patch"; params: { patch: string; revision?: string } };

// We need a SHA1 commit in some places, so we return early if the revision is
// a SHA and else we look into branches.
function getOid(
  revision: string,
  branches?: Record<string, string>,
): string | undefined {
  if (isOid(revision)) return revision;

  if (branches) {
    const oid = branches[revision];
    if (oid) return oid;
  }
  return undefined;
}

// Check whether the input is a SHA1 commit.
export function isOid(input: string): boolean {
  return /^[a-fA-F0-9]{40}$/.test(input);
}

export function parseRevisionToOid(
  revision: string | undefined,
  defaultBranch: string,
  branches: Record<string, string>,
): string {
  if (revision) {
    const oid = getOid(revision, branches);
    if (!oid) {
      throw new Error(`Revision ${revision} not found`);
    }
    return oid;
  }
  return branches[defaultBranch];
}

export async function loadProjectRoute(
  params: ProjectsParams,
): Promise<ProjectLoadedRoute | LoadError> {
  const baseUrl = extractBaseUrl(params.hostnamePort);
  const api = new HttpdClient(baseUrl);
  try {
    if (
      params.view.resource === "tree" ||
      params.view.resource === "history" ||
      params.view.resource === "commits"
    ) {
      const projectPromise = api.project.getById(params.id);
      const peersPromise = api.project.getAllRemotes(params.id);
      const branchesPromise = (async () => {
        if (params.peer) {
          try {
            return (await api.project.getRemoteByPeer(params.id, params.peer))
              .heads;
          } catch {
            return {};
          }
        }
      })();

      const [project, peers, maybeBranches] = await Promise.all([
        projectPromise,
        peersPromise,
        branchesPromise,
      ]);

      let branches: Record<string, string>;
      if (maybeBranches) {
        branches = maybeBranches;
      } else {
        branches = project.head
          ? { [project.defaultBranch]: project.head }
          : {};
      }

      if (params.route) {
        const { revision, path } = detectRevision(params.route, branches);
        params.revision = revision;
        params.path = path;
        // TODO Do not mutate `params`. Contruct a new `loadedParams` object
        // instead.
        delete params.route;
      }

      const commit = parseRevisionToOid(
        params.revision,
        project.defaultBranch,
        branches,
      );
      const tree = await api.project.getTree(params.id, commit);
      return {
        resource: "projects",
        params: {
          ...params,
          project,
          view: {
            resource: params.view.resource,
            params: {
              loadedBranches: branches,
              loadedPeers: peers,
              loadedTree: tree,
              selectedCommit: commit,
            },
          },
        },
      };
    } else {
      const project = await api.project.getById(params.id);
      return {
        resource: "projects",
        params: {
          ...params,
          view: params.view,
          project,
        },
      };
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
      search: undefined,
      ...projectRouteParams,
    },
  };
}

export function projectLinkHref(
  projectRouteParams: Partial<ProjectsParams>,
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
  projectRouteParams: Partial<ProjectsParams>,
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
  hostnamePort: string,
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
      id,
      hostnamePort,
      peer,
      path: undefined,
      revision: undefined,
      search: undefined,
      hash: hash?.substring(1),
      route: segments.join("/"),
    };
  } else if (content === "history") {
    return {
      view: { resource: "history" },
      id,
      hostnamePort,
      peer,
      path: undefined,
      revision: undefined,
      search: undefined,
      route: segments.join("/"),
    };
  } else if (content === "commits") {
    return {
      view: { resource: "commits" },
      id,
      hostnamePort,
      peer,
      path: undefined,
      revision: undefined,
      search: undefined,
      route: segments.join("/"),
    };
  } else if (content === "issues") {
    const issueOrAction = segments.shift();
    if (issueOrAction === "new") {
      return {
        view: { resource: "issues", params: { view: { resource: "new" } } },
        id,
        hostnamePort,
        peer,
        search: sanitizeQueryString(url.search),
        path: undefined,
        revision: undefined,
      };
    } else if (issueOrAction) {
      return {
        view: { resource: "issue", params: { issue: issueOrAction } },
        id,
        hostnamePort,
        peer,
        path: undefined,
        revision: undefined,
        search: undefined,
      };
    } else {
      return {
        view: { resource: "issues" },
        id,
        hostnamePort,
        peer,
        search: sanitizeQueryString(url.search),
        path: undefined,
        revision: undefined,
      };
    }
  } else if (content === "patches") {
    const patch = segments.shift();
    const revision = segments.shift();
    if (patch) {
      return {
        view: { resource: "patch", params: { patch, revision } },
        id,
        hostnamePort,
        peer,
        path: undefined,
        revision: undefined,
        search: sanitizeQueryString(url.search),
      };
    } else {
      return {
        view: { resource: "patches" },
        id,
        hostnamePort,
        peer,
        search: sanitizeQueryString(url.search),
        path: undefined,
        revision: undefined,
      };
    }
  }

  return null;
}

export const testExports = { isOid };
