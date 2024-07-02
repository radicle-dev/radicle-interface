import type {
  ResponseError,
  ResponseParseError,
} from "@http-client/lib/fetcher";
import type { HomeRoute, HomeLoadedRoute } from "@app/views/home/router";
import type {
  ProjectLoadedRoute,
  ProjectRoute,
} from "@app/views/projects/router";
import type { NodesRoute, NodesLoadedRoute } from "@app/views/nodes/router";
import type { ComponentProps } from "svelte";
import type Icon from "@app/components/Icon.svelte";

import { loadProjectRoute } from "@app/views/projects/router";
import { loadNodeRoute } from "@app/views/nodes/router";

interface BootingRoute {
  resource: "booting";
}

export interface NotFoundRoute {
  resource: "notFound";
  params: { title: string };
}

export type ErrorParam = Error | ResponseParseError | ResponseError | undefined;

export interface ErrorRoute {
  resource: "error";
  params: {
    title: string;
    description: string;
    error?: ErrorParam;
    icon?: ComponentProps<Icon>["name"];
  };
}

export type Route =
  | BootingRoute
  | HomeRoute
  | ErrorRoute
  | NotFoundRoute
  | ProjectRoute
  | NodesRoute;

export type LoadedRoute =
  | BootingRoute
  | HomeLoadedRoute
  | ErrorRoute
  | NotFoundRoute
  | ProjectLoadedRoute
  | NodesLoadedRoute;

export async function loadRoute(
  route: Route,
  previousLoaded: LoadedRoute,
): Promise<LoadedRoute> {
  if (route.resource === "nodes") {
    return await loadNodeRoute(route.params);
  } else if (route.resource === "home") {
    return { resource: "home" };
  } else if (
    route.resource === "project.source" ||
    route.resource === "project.history" ||
    route.resource === "project.commit" ||
    route.resource === "project.issues" ||
    route.resource === "project.issue" ||
    route.resource === "project.patches" ||
    route.resource === "project.patch"
  ) {
    return await loadProjectRoute(route, previousLoaded);
  } else {
    return route;
  }
}
