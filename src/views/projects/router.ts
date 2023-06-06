import type { LoadError } from "@app/lib/router/definitions";
import type { Project } from "@httpd-client";

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
  line?: string;
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
  id: string;
  project: Project;
  hash?: string;
  hostnamePort: string;
  line?: string;
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

export async function loadProjectRoute(
  params: ProjectsParams,
): Promise<ProjectLoadedRoute | LoadError> {
  const baseUrl = extractBaseUrl(params.hostnamePort);
  const api = new HttpdClient(baseUrl);
  try {
    const project = await api.project.getById(params.id);
    return { resource: "projects", params: { ...params, project } };
  } catch (error: any) {
    return {
      resource: "loadError",
      params: {
        title: params.hostnamePort,
        errorMessage: "Not able to load this project.",
        stackTrace: error.stack,
      },
    };
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
      line: undefined,
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
    const line = url.href.match(/#L\d+$/)?.pop();
    const hash = url.href.match(/#{1}[^#.]+$/)?.pop();
    return {
      view: { resource: "tree" },
      id,
      hostnamePort,
      peer,
      path: undefined,
      revision: undefined,
      search: undefined,
      line: line?.substring(1),
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
