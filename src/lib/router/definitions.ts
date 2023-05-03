import type { HomeRoute, HomeLoadedRoute } from "@app/views/home/router";
import type { ProjectRoute } from "@app/views/projects/router";
import type { SeedsLoadedRoute, SeedsRoute } from "@app/views/seeds/router";

import { loadHomeRoute } from "@app/views/home/router";
import { loadSeedRoute } from "@app/views/seeds/router";

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
  | SeedsRoute
  | SessionRoute;

export type LoadedRoute =
  | BootingRoute
  | HomeLoadedRoute
  | LoadError
  | NotFoundRoute
  | ProjectRoute
  | SeedsLoadedRoute
  | SessionRoute;

export async function loadRoute(route: Route): Promise<LoadedRoute> {
  if (route.resource === "seeds") {
    return await loadSeedRoute(route.params);
  } else if (route.resource === "home") {
    return await loadHomeRoute();
  } else {
    return route;
  }
}
