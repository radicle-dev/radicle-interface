import type { LoadError } from "@app/lib/router/definitions";
import type {
  BaseUrl,
  Blob,
  Commit,
  CommitHeader,
  Diff,
  Issue,
  Patch,
  Project,
  Remote,
  Tree,
} from "@httpd-client";

import { HttpdClient } from "@httpd-client";
import { getFileExtension, unreachable } from "@app/lib/utils";
import { seedPath } from "@app/views/seeds/router";
import {
  HighlightConfiguration,
  Highlighter,
  handleInjections,
  renderHTML,
} from "@app/lib/syntax";

export const COMMITS_PER_PAGE = 30;

export type ProjectRoute =
  | ProjectTreeRoute
  | ProjectHistoryRoute
  | {
      resource: "project.commit";
      seed: BaseUrl;
      project: string;
      commit: string;
    }
  | {
      resource: "project.issues";
      seed: BaseUrl;
      project: string;
      search?: string;
    }
  | { resource: "project.newIssue"; seed: BaseUrl; project: string }
  | {
      resource: "project.issue";
      seed: BaseUrl;
      project: string;
      issue: string;
    }
  | ProjectPatchesRoute
  | ProjectPatchRoute;

interface ProjectTreeRoute {
  resource: "project.tree";
  seed: BaseUrl;
  project: string;
  path?: string;
  peer?: string;
  revision?: string;
  route?: string;
}

interface ProjectHistoryRoute {
  resource: "project.history";
  seed: BaseUrl;
  project: string;
  peer?: string;
  revision?: string;
}

interface ProjectPatchRoute {
  resource: "project.patch";
  seed: BaseUrl;
  project: string;
  patch: string;
  view?:
    | {
        name: "activity";
      }
    | {
        name: "commits" | "files";
        revision?: string;
      }
    | {
        name: "diff";
        fromCommit: string;
        toCommit: string;
      };
}

interface ProjectPatchesRoute {
  resource: "project.patches";
  seed: BaseUrl;
  project: string;
  search?: string;
}

export interface ProjectLoadedRoute {
  resource: "projects";
  params: ProjectLoadedParams;
}

export interface ProjectLoadedParams {
  baseUrl: BaseUrl;
  id: string;
  project: Project;
  view: ProjectLoadedView;
}
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
      resource: "history";
      peer: string | undefined;
      revision: string | undefined;
      params: LoadedSourceBrowsingParams;
      commitHeaders: CommitHeader[];
      totalCommitCount: number;
    };

interface LoadedSourceBrowsingParams {
  loadedBranches: Record<string, string> | undefined;
  loadedPeers: Remote[];
  loadedTree: Tree;
}

export type ProjectLoadedView =
  | LoadedSourceBrowsingView
  | {
      resource: "commit";
      commit: Commit;
      highlightedFiles: Map<string, string[]>;
    }
  | { resource: "issue"; issue: Issue }
  | { resource: "issues"; search: string }
  | { resource: "newIssue" }
  | { resource: "patches"; search: string }
  | PatchView;

export type BlobResult =
  | { ok: true; blob: Blob; highlighted: string[] | undefined }
  | { ok: false; error: { message: string; path: string } };

export interface PatchView {
  resource: "patch";
  patch: Patch;
  view:
    | {
        name: "activity";
        revision: string;
      }
    | {
        name: "commits" | "files";
        revision: string;
        diff: Diff;
        commits: CommitHeader[];
      }
    | {
        name: "diff";
        diff: Diff;
        fromCommit: string;
        toCommit: string;
      };
}

// Check whether the input is a SHA1 commit.
function isOid(input: string): boolean {
  return /^[a-fA-F0-9]{40}$/.test(input);
}

function parseRevisionToOid(
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
  route: ProjectRoute,
): Promise<ProjectLoadedRoute | LoadError> {
  const api = new HttpdClient(route.seed);
  try {
    if (route.resource === "project.tree") {
      return loadTreeView(route);
    } else if (route.resource === "project.history") {
      return loadHistoryView(route);
    } else if (route.resource === "project.commit") {
      const [project, commit] = await Promise.all([
        api.project.getById(route.project),
        api.project.getCommitBySha(route.project, route.commit),
      ]);

      const files = new Map<string, string[]>();
      for (const diff of Object.values(commit.diff).flat()) {
        if ("path" in diff) {
          const blob = await api.project.getBlob(
            route.project,
            route.commit,
            diff.path,
          );

          const fileExtension = getFileExtension(blob.path);
          if (!fileExtension) {
            throw Error("File extension not found");
          }

          if (blob.content) {
            const parser = await Highlighter.init();
            const config = await HighlightConfiguration.create(fileExtension);
            if (!config) {
              throw Error("Highlight configuration not found");
            }
            parser.setLanguage(config.language);

            const tree = await parser.parse(blob.content);
            const captures = config.query.captures(tree.rootNode);
            const capturesWithInjections = captures.map(capture =>
              handleInjections(capture, parser),
            );
            const resolvedCaptures = (
              await Promise.all(capturesWithInjections)
            ).flat();
            files.set(diff.path, renderHTML(resolvedCaptures, blob.content));
          }
        }
      }

      return {
        resource: "projects",
        params: {
          id: route.project,
          baseUrl: route.seed,
          project,
          view: {
            resource: "commit",
            commit,
            highlightedFiles: files,
          },
        },
      };
    } else if (route.resource === "project.issue") {
      try {
        const projectPromise = api.project.getById(route.project);
        const issuePromise = api.project.getIssueById(
          route.project,
          route.issue,
        );
        const [project, issue] = await Promise.all([
          projectPromise,
          issuePromise,
        ]);
        return {
          resource: "projects",
          params: {
            id: route.project,
            baseUrl: route.seed,
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
            title: route.issue,
            errorMessage: "Not able to load this issue.",
            stackTrace: error.stack,
          },
        };
      }
    } else if (route.resource === "project.patch") {
      return loadPatchView(route);
    } else if (route.resource === "project.issues") {
      const project = await api.project.getById(route.project);
      return {
        resource: "projects",
        params: {
          id: route.project,
          baseUrl: route.seed,
          view: {
            resource: "issues",
            search: route.search || "",
          },
          project,
        },
      };
    } else if (route.resource === "project.newIssue") {
      const project = await api.project.getById(route.project);
      return {
        resource: "projects",
        params: {
          id: route.project,
          baseUrl: route.seed,
          view: {
            resource: "newIssue",
          },
          project,
        },
      };
    } else if (route.resource === "project.patches") {
      const project = await api.project.getById(route.project);
      return {
        resource: "projects",
        params: {
          id: route.project,
          baseUrl: route.seed,
          view: {
            resource: "patches",
            search: route.search || "",
          },
          project,
        },
      };
    } else {
      return unreachable(route);
    }
  } catch (error: any) {
    return {
      resource: "loadError",
      params: {
        title: route.project,
        errorMessage: "Not able to load this project.",
        stackTrace: error.stack,
      },
    };
  }
}

async function loadTreeView(
  route: ProjectTreeRoute,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.seed);

  const [project, peers, branches] = await Promise.all([
    api.project.getById(route.project),
    api.project.getAllRemotes(route.project),
    getPeerBranches(api, route.project, route.peer),
  ]);

  if (route.route) {
    const { revision, path } = detectRevision(
      route.route,
      branches || { [project.defaultBranch]: project.head },
    );
    route.revision = revision;
    route.path = path;
  }

  const commit = parseRevisionToOid(
    route.revision,
    project.defaultBranch,
    branches || { [project.defaultBranch]: project.head },
  );

  const path = route.path || "/";

  const [tree, blobResult] = await Promise.all([
    api.project.getTree(route.project, commit),
    loadBlob(api, project.id, commit, path),
  ]);
  return {
    resource: "projects",
    params: {
      id: route.project,
      baseUrl: route.seed,
      project,
      view: {
        resource: "tree",
        peer: route.peer,
        revision: route.revision,
        params: {
          loadedBranches: branches,
          loadedPeers: peers,
          loadedTree: tree,
        },
        path,
        blobResult,
      },
    },
  };
}

async function loadBlob(
  api: HttpdClient,
  project: string,
  commit: string,
  path: string,
): Promise<BlobResult> {
  try {
    let blob: Blob;
    if (path === "" || path === "/") {
      blob = await api.project.getReadme(project, commit);
    } else {
      blob = await api.project.getBlob(project, commit, path);
    }

    const fileExtension = getFileExtension(blob.path);
    if (!fileExtension) {
      return { ok: true, blob, highlighted: undefined };
    }

    try {
      let highlighted: string[] | undefined = undefined;

      if (blob.content) {
        const parser = await Highlighter.init();
        const config = await HighlightConfiguration.create(fileExtension);
        if (!config) {
          return { ok: true, blob, highlighted: undefined };
        }
        parser.setLanguage(config.language);

        const tree = await parser.parse(blob.content);
        const captures = config.query.captures(tree.rootNode);
        const capturesWithInjections = captures.map(capture =>
          handleInjections(capture, parser),
        );
        const resolvedCaptures = (
          await Promise.all(capturesWithInjections)
        ).flat();
        highlighted = renderHTML(resolvedCaptures, blob.content);
      }

      return { ok: true, blob, highlighted };
    } catch {
      return { ok: true, blob, highlighted: undefined };
    }
  } catch {
    if (path === "/") {
      return {
        ok: false,
        error: {
          message: "The README could not be loaded",
          path,
        },
      };
    } else {
      return {
        ok: false,
        error: {
          message: "Not able to load file",
          path,
        },
      };
    }
  }
}
async function loadHistoryView(
  route: ProjectHistoryRoute,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.seed);

  const [project, peers, branches] = await Promise.all([
    api.project.getById(route.project),
    api.project.getAllRemotes(route.project),
    getPeerBranches(api, route.project, route.peer),
  ]);

  let commitId;
  if (route.revision && isOid(route.revision)) {
    commitId = route.revision;
  } else if (branches) {
    commitId = branches[route.revision || project.defaultBranch];
  } else if (!route.revision) {
    commitId = project.head;
  }

  if (!commitId) {
    throw new Error(
      `Revision ${route.revision} not found for project ${project.id}`,
    );
  }

  const [tree, commitsResponse] = await Promise.all([
    api.project.getTree(route.project, commitId),
    await api.project.getAllCommits(project.id, {
      parent: commitId,
      page: 0,
      perPage: COMMITS_PER_PAGE,
    }),
  ]);

  return {
    resource: "projects",
    params: {
      id: route.project,
      baseUrl: route.seed,
      project,
      view: {
        resource: "history",
        peer: route.peer,
        revision: route.revision,
        params: {
          loadedBranches: branches,
          loadedPeers: peers,
          loadedTree: tree,
        },
        commitHeaders: commitsResponse.commits.map(c => c.commit),
        totalCommitCount: commitsResponse.stats.commits,
      },
    },
  };
}

async function loadPatchView(
  route: ProjectPatchRoute,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.seed);
  const [project, patch] = await Promise.all([
    api.project.getById(route.project),
    api.project.getPatchById(route.project, route.patch),
  ]);
  const latestRevision = patch.revisions[patch.revisions.length - 1];

  let view: PatchView["view"];
  switch (route.view?.name) {
    case "activity":
    case undefined: {
      view = { name: "activity", revision: latestRevision.id };
      break;
    }
    case "commits":
    case "files": {
      const revisionId = route.view.revision;
      const revision =
        patch.revisions.find(r => r.id === revisionId) || latestRevision;
      if (!revision) {
        throw new Error(
          `revision ${revisionId} of patch ${route.patch} not found`,
        );
      }
      const { diff, commits } = await api.project.getDiff(
        route.project,
        revision.base,
        revision.oid,
      );
      view = {
        name: route.view?.name,
        revision: revision.id,
        diff,
        commits,
      };
      break;
    }
    case "diff": {
      const { fromCommit, toCommit } = route.view;
      const { diff } = await api.project.getDiff(
        route.project,
        fromCommit,
        toCommit,
      );

      view = { name: "diff", fromCommit, toCommit, diff };
      break;
    }
  }
  return {
    resource: "projects",
    params: {
      id: route.project,
      baseUrl: route.seed,
      project,
      view: {
        resource: "patch",
        patch,
        view,
      },
    },
  };
}

async function getPeerBranches(
  api: HttpdClient,
  project: string,
  peer?: string,
) {
  if (peer) {
    return (await api.project.getRemoteByPeer(project, peer)).heads;
  } else {
    return undefined;
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
  seed: BaseUrl,
  project: string,
  segments: string[],
  urlSearch: string,
): ProjectRoute | null {
  let content = segments.shift();
  let peer;
  if (content === "remotes") {
    peer = segments.shift();
    content = segments.shift();
  }

  if (!content || content === "tree") {
    return {
      resource: "project.tree",
      seed,
      project,
      peer,
      path: undefined,
      revision: undefined,
      route: segments.join("/"),
    };
  } else if (content === "history") {
    return {
      resource: "project.history",
      seed,
      project,
      peer,
      revision: segments.join("/"),
    };
  } else if (content === "commits") {
    return {
      resource: "project.commit",
      seed,
      project,
      commit: segments[0],
    };
  } else if (content === "issues") {
    const issueOrAction = segments.shift();
    if (issueOrAction === "new") {
      return {
        resource: "project.newIssue",
        seed,
        project,
      };
    } else if (issueOrAction) {
      return {
        resource: "project.issue",
        seed,
        project,
        issue: issueOrAction,
      };
    } else {
      return {
        resource: "project.issues",
        seed,
        project,
        search: sanitizeQueryString(urlSearch),
      };
    }
  } else if (content === "patches") {
    return resolvePatchesRoute(seed, project, segments, urlSearch);
  } else {
    return null;
  }
}

function resolvePatchesRoute(
  seed: BaseUrl,
  project: string,
  segments: string[],
  urlSearch: string,
): ProjectPatchRoute | ProjectPatchesRoute {
  const patch = segments.shift();
  const revision = segments.shift();
  if (patch) {
    const searchParams = new URLSearchParams(sanitizeQueryString(urlSearch));
    const tab = searchParams.get("tab");
    const base = {
      resource: "project.patch",
      seed,
      project,
      patch,
    } as const;
    const diff = searchParams.get("diff");
    if (diff) {
      const [fromCommit, toCommit] = diff.split("..");
      if (isOid(fromCommit) && isOid(toCommit)) {
        return {
          ...base,
          view: { name: "diff", fromCommit, toCommit },
        };
      }
    }

    if (tab === "commits" || tab === "files") {
      return {
        ...base,
        view: { name: tab, revision },
      };
    } else if (tab === "activity") {
      return {
        ...base,
        view: { name: tab },
      };
    } else {
      return base;
    }
  } else {
    return {
      resource: "project.patches",
      seed,
      project,
      search: sanitizeQueryString(urlSearch),
    };
  }
}

export function projectRouteToPath(route: ProjectRoute): string {
  const seed = seedPath(route.seed);

  const pathSegments = [seed, route.project];

  if (route.resource === "project.tree") {
    if (route.peer) {
      pathSegments.push("remotes", route.peer);
    }

    pathSegments.push("tree");
    let omitTree = true;

    if (route.route && route.route !== "/") {
      pathSegments.push(route.route);
      omitTree = false;
    } else {
      if (route.revision) {
        pathSegments.push(route.revision);
        omitTree = false;
      }

      if (route.path && route.path !== "/") {
        pathSegments.push(route.path);
        omitTree = false;
      }
    }
    if (omitTree) {
      pathSegments.pop();
    }

    return pathSegments.join("/");
  } else if (route.resource === "project.history") {
    if (route.peer) {
      pathSegments.push("remotes", route.peer);
    }

    pathSegments.push("history");

    if (route.revision) {
      pathSegments.push(route.revision);
    }
    return pathSegments.join("/");
  } else if (route.resource === "project.commit") {
    return [...pathSegments, "commits", route.commit].join("/");
  } else if (route.resource === "project.newIssue") {
    return [...pathSegments, "issues", "new"].join("/");
  } else if (route.resource === "project.issues") {
    let url = [...pathSegments, "issues"].join("/");
    if (route.search) {
      url += `?${route.search}`;
    }
    return url;
  } else if (route.resource === "project.issue") {
    return [...pathSegments, "issues", route.issue].join("/");
  } else if (route.resource === "project.patches") {
    let url = [...pathSegments, "patches"].join("/");
    if (route.search) {
      url += `?${route.search}`;
    }
    return url;
  } else if (route.resource === "project.patch") {
    return patchRouteToPath(route);
  } else {
    return unreachable(route);
  }
}

function patchRouteToPath(route: ProjectPatchRoute): string {
  const seed = seedPath(route.seed);

  const pathSegments = [seed, route.project];

  pathSegments.push("patches", route.patch);
  if (route.view?.name === "commits" || route.view?.name === "files") {
    if (route.view.revision) {
      pathSegments.push(route.view.revision);
    }
  }

  let url = pathSegments.join("/");
  if (!route.view) {
    return url;
  } else {
    const searchParams = new URLSearchParams();

    if (route.view.name === "diff") {
      searchParams.set(
        "diff",
        `${route.view.fromCommit}..${route.view.toCommit}`,
      );
    } else {
      searchParams.set("tab", route.view.name);
    }
    url += `?${searchParams.toString()}`;
    return url;
  }
}

export function projectTitle(loadedRoute: ProjectLoadedRoute) {
  const title: string[] = [];

  if (loadedRoute.params.view.resource === "tree") {
    title.push(loadedRoute.params.project.name);
    title.push(loadedRoute.params.project.description);
  } else if (loadedRoute.params.view.resource === "commit") {
    title.push(loadedRoute.params.view.commit.commit.summary);
    title.push("commit");
  } else if (loadedRoute.params.view.resource === "history") {
    title.push(loadedRoute.params.project.name);
    title.push("history");
  } else if (loadedRoute.params.view.resource === "newIssue") {
    title.push("new issue");
  } else if (loadedRoute.params.view.resource === "issue") {
    title.push(loadedRoute.params.view.issue.title);
    title.push("issue");
  } else if (loadedRoute.params.view.resource === "issues") {
    title.push(loadedRoute.params.project.name);
    title.push("issues");
  } else if (loadedRoute.params.view.resource === "patch") {
    title.push(loadedRoute.params.view.patch.title);
    title.push("patch");
  } else if (loadedRoute.params.view.resource === "patches") {
    title.push(loadedRoute.params.project.name);
    title.push("patches");
  } else {
    return unreachable(loadedRoute.params.view);
  }

  return title;
}

export const testExports = { isOid };
