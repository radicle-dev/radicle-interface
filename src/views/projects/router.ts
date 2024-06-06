import type {
  ErrorRoute,
  LoadedRoute,
  NotFoundRoute,
} from "@app/lib/router/definitions";
import type {
  BaseUrl,
  Blob,
  Commit,
  CommitBlob,
  CommitHeader,
  Diff,
  DiffBlob,
  Issue,
  IssueState,
  Node,
  Patch,
  PatchState,
  Project,
  Remote,
  Tree,
} from "@http-client";

import * as Syntax from "@app/lib/syntax";
import * as httpd from "@app/lib/httpd";
import { HttpdClient } from "@http-client";
import { ResponseError, ResponseParseError } from "@http-client/lib/fetcher";
import { experimental } from "@app/lib/appearance";
import { get } from "svelte/store";
import { handleError, unreachableError } from "@app/views/projects/error";
import { nodePath } from "@app/views/nodes/router";
import { unreachable } from "@app/lib/utils";

export const COMMITS_PER_PAGE = 30;
export const PATCHES_PER_PAGE = 10;
export const ISSUES_PER_PAGE = 10;

export type ProjectRoute =
  | ProjectTreeRoute
  | ProjectHistoryRoute
  | {
      resource: "project.commit";
      node: BaseUrl;
      project: string;
      commit: string;
    }
  | ProjectIssuesRoute
  | ProjectIssueRoute
  | { resource: "project.newIssue"; node: BaseUrl; project: string }
  | ProjectPatchesRoute
  | ProjectPatchRoute;

interface ProjectIssuesRoute {
  resource: "project.issues";
  node: BaseUrl;
  project: string;
  state?: "open" | "closed";
}

interface ProjectIssueRoute {
  resource: "project.issue";
  node: BaseUrl;
  project: string;
  issue: string;
}

interface ProjectTreeRoute {
  resource: "project.source";
  node: BaseUrl;
  project: string;
  path?: string;
  peer?: string;
  revision?: string;
  route?: string;
}

interface ProjectHistoryRoute {
  resource: "project.history";
  node: BaseUrl;
  project: string;
  peer?: string;
  revision?: string;
}

interface ProjectPatchRoute {
  resource: "project.patch";
  node: BaseUrl;
  project: string;
  patch: string;
  view?:
    | {
        name: "activity";
      }
    | {
        name: "changes";
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
  node: BaseUrl;
  project: string;
  search?: string;
}

export type ProjectLoadedRoute =
  | {
      resource: "project.source";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        commit: string;
        project: Project;
        peers: Remote[];
        peer: string | undefined;
        branches: string[];
        revision: string | undefined;
        tree: Tree;
        path: string;
        rawPath: (commit?: string) => string;
        blobResult: BlobResult;
        seeding: boolean;
      };
    }
  | {
      resource: "project.history";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        commit: string;
        project: Project;
        peers: Remote[];
        peer: string | undefined;
        branches: string[];
        revision: string | undefined;
        tree: Tree;
        commitHeaders: CommitHeader[];
        seeding: boolean;
      };
    }
  | {
      resource: "project.commit";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        project: Project;
        commit: Commit;
      };
    }
  | {
      resource: "project.issue";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        project: Project;
        rawPath: (commit?: string) => string;
        issue: Issue;
      };
    }
  | {
      resource: "project.issues";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        project: Project;
        issues: Issue[];
        state: IssueState["status"];
      };
    }
  | {
      resource: "project.newIssue";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        project: Project;
        rawPath: (commit?: string) => string;
      };
    }
  | {
      resource: "project.patches";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        project: Project;
        patches: Patch[];
        state: PatchState["status"];
      };
    }
  | {
      resource: "project.patch";
      params: {
        baseUrl: BaseUrl;
        node: Node;
        project: Project;
        rawPath: (commit?: string) => string;
        patch: Patch;
        stats: Diff["stats"];
        view: PatchView;
      };
    };

export type BlobResult =
  | { ok: true; blob: Blob; highlighted: Syntax.Root | undefined }
  | { ok: false; error: { status?: number; message: string; path: string } };

export type PatchView =
  | {
      name: "activity";
      revision: string;
    }
  | {
      name: "changes";
      revision: string;
      oid: string;
      diff: Diff;
      commits: CommitHeader[];
      files: Record<string, CommitBlob>;
    }
  | {
      name: "diff";
      diff: Diff;
      files: Record<string, DiffBlob>;
      fromCommit: string;
      toCommit: string;
    };

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

async function isLocalNodeSeeding(route: ProjectRoute): Promise<boolean> {
  if (!get(experimental) && get(httpd.httpdStore).state === "stopped") {
    return false;
  }
  try {
    const tracking = await httpd.api.getTracking();
    return tracking.some(({ id }) => id === route.project);
  } catch (error) {
    if (error instanceof ResponseError && error.status === 404) {
      return false;
    }

    // Either `radicle-httpd` isn't running or there was some other
    // error.
    return false;
  }
}

export async function loadProjectRoute(
  route: ProjectRoute,
  previousLoaded: LoadedRoute,
): Promise<ProjectLoadedRoute | ErrorRoute | NotFoundRoute> {
  const api = new HttpdClient(route.node);
  let node: Node | undefined = undefined;
  if (
    "params" in previousLoaded &&
    "node" in previousLoaded.params &&
    route.node.hostname === previousLoaded.params.baseUrl.hostname
  ) {
    node = previousLoaded.params.node;
  } else {
    node = await api.getNode();
  }
  const rawPath = (commit?: string) =>
    `${route.node.scheme}://${route.node.hostname}:${route.node.port}/raw/${
      route.project
    }${commit ? `/${commit}` : ""}`;

  try {
    if (route.resource === "project.source") {
      return await loadTreeView(route, previousLoaded, node);
    } else if (route.resource === "project.history") {
      return await loadHistoryView(route, node);
    } else if (route.resource === "project.commit") {
      const [project, commit] = await Promise.all([
        api.project.getById(route.project),
        api.project.getCommitBySha(route.project, route.commit),
      ]);

      return {
        resource: "project.commit",
        params: {
          baseUrl: route.node,
          node,
          project,
          commit,
        },
      };
    } else if (route.resource === "project.issue") {
      return await loadIssueView(route, node);
    } else if (route.resource === "project.patch") {
      return await loadPatchView(route, node);
    } else if (route.resource === "project.issues") {
      return await loadIssuesView(route, node);
    } else if (route.resource === "project.newIssue") {
      const project = await api.project.getById(route.project);
      return {
        resource: "project.newIssue",
        params: {
          baseUrl: route.node,
          node,
          project,
          rawPath,
        },
      };
    } else if (route.resource === "project.patches") {
      return await loadPatchesView(route, node);
    } else {
      return unreachable(route);
    }
  } catch (error) {
    if (
      error instanceof Error ||
      error instanceof ResponseError ||
      error instanceof ResponseParseError
    ) {
      return handleError(error, route);
    } else {
      return unreachableError();
    }
  }
}

async function loadPatchesView(
  route: ProjectPatchesRoute,
  node: Node,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.node);
  const searchParams = new URLSearchParams(route.search || "");
  const state = (searchParams.get("state") as PatchState["status"]) || "open";

  const [project, patches] = await Promise.all([
    api.project.getById(route.project),
    api.project.getAllPatches(route.project, {
      state,
      page: 0,
      perPage: PATCHES_PER_PAGE,
    }),
  ]);

  return {
    resource: "project.patches",
    params: {
      baseUrl: route.node,
      node,
      patches,
      state,
      project,
    },
  };
}

async function loadIssuesView(
  route: ProjectIssuesRoute,
  node: Node,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.node);
  const state = route.state || "open";

  const [project, issues] = await Promise.all([
    api.project.getById(route.project),
    api.project.getAllIssues(route.project, {
      state,
      page: 0,
      perPage: ISSUES_PER_PAGE,
    }),
    isLocalNodeSeeding(route),
  ]);

  return {
    resource: "project.issues",
    params: {
      baseUrl: route.node,
      node,
      issues,
      state,
      project,
    },
  };
}

async function loadTreeView(
  route: ProjectTreeRoute,
  previousLoaded: LoadedRoute,
  node: Node,
): Promise<ProjectLoadedRoute | NotFoundRoute> {
  const api = new HttpdClient(route.node);
  const rawPath = (commit?: string) =>
    `${route.node.scheme}://${route.node.hostname}:${route.node.port}/raw/${
      route.project
    }${commit ? `/${commit}` : ""}`;

  let projectPromise: Promise<Project>;
  let peersPromise: Promise<Remote[]>;
  if (
    previousLoaded.resource === "project.source" &&
    previousLoaded.params.project.id === route.project &&
    previousLoaded.params.peer === route.peer
  ) {
    projectPromise = Promise.resolve(previousLoaded.params.project);
    peersPromise = Promise.resolve(previousLoaded.params.peers);
  } else {
    projectPromise = api.project.getById(route.project);
    peersPromise = api.project.getAllRemotes(route.project);
  }

  const [project, peers, seeding] = await Promise.all([
    projectPromise,
    peersPromise,
    isLocalNodeSeeding(route),
  ]);

  let branchMap: Record<string, string>;
  if (route.peer) {
    const peer = peers.find(peer => peer.id === route.peer);
    if (!peer) {
      return {
        resource: "notFound",
        params: { title: `Peer ${route.peer} could not be found` },
      };
    } else {
      branchMap = peer.heads;
    }
  } else {
    branchMap = { [project.defaultBranch]: project.head };
  }

  if (route.route) {
    const { revision, path } = detectRevision(
      route.route,
      branchMap || { [project.defaultBranch]: project.head },
    );
    route.revision = revision;
    route.path = path;
  }

  const commit = parseRevisionToOid(
    route.revision,
    project.defaultBranch,
    branchMap,
  );
  const path = route.path || "/";
  const [tree, blobResult] = await Promise.all([
    api.project.getTree(route.project, commit),
    loadBlob(api, project.id, commit, path),
  ]);
  return {
    resource: "project.source",
    params: {
      baseUrl: route.node,
      node,
      commit,
      project,
      peers: peers.filter(remote => Object.keys(remote.heads).length > 0),
      peer: route.peer,
      branches: Object.keys(branchMap),
      rawPath,
      revision: route.revision,
      tree,
      path,
      blobResult,
      seeding,
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
    return {
      ok: true,
      blob,
      highlighted: blob.content
        ? await Syntax.highlight(blob.content, blob.path.split(".").pop() ?? "")
        : undefined,
    };
  } catch (e: unknown) {
    if (e instanceof ResponseError) {
      return {
        ok: false,
        error: {
          status: e.status,
          message: "Not able to load file",
          path,
        },
      };
    } else if (path === "/") {
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
  node: Node,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.node);

  const [project, peers, branchMap] = await Promise.all([
    api.project.getById(route.project),
    api.project.getAllRemotes(route.project),
    getPeerBranches(api, route.project, route.peer),
  ]);

  let commitId;
  if (route.revision && isOid(route.revision)) {
    commitId = route.revision;
  } else if (branchMap) {
    commitId = branchMap[route.revision || project.defaultBranch];
  } else if (!route.revision) {
    commitId = project.head;
  }

  if (!commitId) {
    throw new Error(
      `Revision ${route.revision} not found for project ${project.id}`,
    );
  }

  const [tree, commitHeaders, seeding] = await Promise.all([
    api.project.getTree(route.project, commitId),
    await api.project.getAllCommits(project.id, {
      parent: commitId,
      page: 0,
      perPage: COMMITS_PER_PAGE,
    }),
    isLocalNodeSeeding(route),
  ]);

  return {
    resource: "project.history",
    params: {
      baseUrl: route.node,
      node,
      commit: commitId,
      project,
      peers: peers.filter(remote => Object.keys(remote.heads).length > 0),
      peer: route.peer,
      branches: Object.keys(branchMap || {}),
      revision: route.revision,
      tree,
      commitHeaders,
      seeding,
    },
  };
}

async function loadIssueView(
  route: ProjectIssueRoute,
  node: Node,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.node);
  const rawPath = (commit?: string) =>
    `${route.node.scheme}://${route.node.hostname}:${route.node.port}/raw/${
      route.project
    }${commit ? `/${commit}` : ""}`;

  const [project, issue] = await Promise.all([
    api.project.getById(route.project),
    api.project.getIssueById(route.project, route.issue),
  ]);
  return {
    resource: "project.issue",
    params: {
      baseUrl: route.node,
      node,
      project,
      rawPath,
      issue,
    },
  };
}

async function loadPatchView(
  route: ProjectPatchRoute,
  node: Node,
): Promise<ProjectLoadedRoute> {
  const api = new HttpdClient(route.node);
  const rawPath = (commit?: string) =>
    `${route.node.scheme}://${route.node.hostname}:${route.node.port}/raw/${
      route.project
    }${commit ? `/${commit}` : ""}`;

  const [project, patch] = await Promise.all([
    api.project.getById(route.project),
    api.project.getPatchById(route.project, route.patch),
  ]);
  const latestRevision = patch.revisions[patch.revisions.length - 1];
  const { diff } = await api.project.getDiff(
    route.project,
    latestRevision.base,
    latestRevision.oid,
  );

  let view: PatchView;
  switch (route.view?.name) {
    case "activity":
    case undefined: {
      view = { name: "activity", revision: latestRevision.id };
      break;
    }
    case "changes": {
      const revisionId = route.view.revision;
      const revision =
        patch.revisions.find(r => r.id === revisionId) || latestRevision;
      if (!revision) {
        throw new Error(
          `revision ${revisionId} of patch ${route.patch} not found`,
        );
      }
      const { diff, commits, files } = await api.project.getDiff(
        route.project,
        revision.base,
        revision.oid,
      );
      view = {
        name: route.view?.name,
        revision: revision.id,
        oid: revision.oid,
        diff,
        commits,
        files,
      };
      break;
    }
    case "diff": {
      const { fromCommit, toCommit } = route.view;
      const { diff, files } = await api.project.getDiff(
        route.project,
        fromCommit,
        toCommit,
      );

      view = { name: "diff", fromCommit, toCommit, files, diff };
      break;
    }
  }
  return {
    resource: "project.patch",
    params: {
      baseUrl: route.node,
      node,
      project,
      rawPath,
      patch,
      stats: diff.stats,
      view,
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
  node: BaseUrl,
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
      resource: "project.source",
      node,
      project,
      peer,
      path: undefined,
      revision: undefined,
      route: segments.join("/"),
    };
  } else if (content === "history") {
    return {
      resource: "project.history",
      node,
      project,
      peer,
      revision: segments.join("/"),
    };
  } else if (content === "commits") {
    return {
      resource: "project.commit",
      node,
      project,
      commit: segments[0],
    };
  } else if (content === "issues") {
    const issueOrAction = segments.shift();
    if (issueOrAction === "new") {
      return {
        resource: "project.newIssue",
        node,
        project,
      };
    } else if (issueOrAction) {
      return {
        resource: "project.issue",
        node,
        project,
        issue: issueOrAction,
      };
    } else {
      const rawState = new URLSearchParams(sanitizeQueryString(urlSearch)).get(
        "state",
      );
      let state: "open" | "closed" | undefined;
      if (rawState === "open" || rawState === "closed") {
        state = rawState;
      }
      return {
        resource: "project.issues",
        node,
        project,
        state,
      };
    }
  } else if (content === "patches") {
    return resolvePatchesRoute(node, project, segments, urlSearch);
  } else {
    return null;
  }
}

function resolvePatchesRoute(
  node: BaseUrl,
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
      node,
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

    if (tab === "changes") {
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
      node,
      project,
      search: sanitizeQueryString(urlSearch),
    };
  }
}

export function projectRouteToPath(route: ProjectRoute): string {
  const node = nodePath(route.node);

  const pathSegments = [node, route.project];

  if (route.resource === "project.source") {
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
    const searchParams = new URLSearchParams();
    if (route.state) {
      searchParams.set("state", route.state);
    }
    if (searchParams.size > 0) {
      url += `?${searchParams}`;
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
  const node = nodePath(route.node);

  const pathSegments = [node, route.project];

  pathSegments.push("patches", route.patch);
  if (route.view?.name === "changes") {
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

  if (loadedRoute.resource === "project.source") {
    title.push(loadedRoute.params.project.name);
    if (loadedRoute.params.project.description.length > 0) {
      title.push(loadedRoute.params.project.description);
    }
  } else if (loadedRoute.resource === "project.commit") {
    title.push(loadedRoute.params.commit.commit.summary);
    title.push("commit");
  } else if (loadedRoute.resource === "project.history") {
    title.push(loadedRoute.params.project.name);
    title.push("history");
  } else if (loadedRoute.resource === "project.newIssue") {
    title.push("new issue");
  } else if (loadedRoute.resource === "project.issue") {
    title.push(loadedRoute.params.issue.title);
    title.push("issue");
  } else if (loadedRoute.resource === "project.issues") {
    title.push(loadedRoute.params.project.name);
    title.push("issues");
  } else if (loadedRoute.resource === "project.patch") {
    title.push(loadedRoute.params.patch.title);
    title.push("patch");
  } else if (loadedRoute.resource === "project.patches") {
    title.push(loadedRoute.params.project.name);
    title.push("patches");
  } else {
    return unreachable(loadedRoute);
  }

  return title;
}

export const testExports = { isOid };
