import type { BaseUrl } from "@http-client";
import type { ErrorRoute } from "@app/lib/router/definitions";

export interface HomeRoute {
  resource: "home";
}

export interface HomeLoadedRoute {
  resource: "home";
  params: { configPreferredSeeds: BaseUrl[] };
}

export async function loadHomeRoute(): Promise<HomeLoadedRoute | ErrorRoute> {
  return {
    resource: "home",
    params: { configPreferredSeeds: [] },
  };
}
