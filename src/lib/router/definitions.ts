import type { HomeRoute, HomeLoadedRoute } from "@app/views/home/router";
import type {
  ProjectLoadedRoute,
  ProjectRoute,
} from "@app/views/projects/router";
import type { NodesRoute, NodesLoadedRoute } from "@app/views/nodes/router";

import { loadHomeRoute } from "@app/views/home/router";
import { loadProjectRoute } from "@app/views/projects/router";
import { loadNodeRoute } from "@app/views/nodes/router";

interface BootingRoute {
  resource: "booting";
}

interface NotFoundRoute {
  resource: "notFound";
  params: { url: string };
}

interface SessionRoute {
  resource: "session";
  params: { id: string; signature: string; publicKey: string };
}

export interface LoadError {
  resource: "loadError";
  params: {
    title?: string;
    errorMessage: string;
    stackTrace: string;
  };
}

export type Route =
  | BootingRoute
  | HomeRoute
  | LoadError
  | NotFoundRoute
  | ProjectRoute
  | NodesRoute
  | SessionRoute;

export type LoadedRoute =
  | BootingRoute
  | HomeLoadedRoute
  | LoadError
  | NotFoundRoute
  | ProjectLoadedRoute
  | NodesLoadedRoute
  | SessionRoute;

export async function loadRoute(route: Route): Promise<LoadedRoute> {
  if (route.resource === "nodes") {
    return await loadNodeRoute(route.params);
  } else if (route.resource === "home") {
    return await loadHomeRoute();
  } else if (
    route.resource === "project.tree" ||
    route.resource === "project.history" ||
    route.resource === "project.commit" ||
    route.resource === "project.issues" ||
    route.resource === "project.newIssue" ||
    route.resource === "project.issue" ||
    route.resource === "project.patches" ||
    route.resource === "project.patch"
  ) {
    return await loadProjectRoute(route);
  } else {
    return route;
  }
}
