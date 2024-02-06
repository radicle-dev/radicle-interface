import type { LoadErrorRoute } from "@app/lib/router/definitions";
import * as seeds from "@app/lib/seeds";
export interface HomeRoute {
  resource: "home";
}

export interface HomeLoadedRoute {
  resource: "home";
  params: Record<string, never>;
}

export async function loadHomeRoute(): Promise<
  HomeLoadedRoute | LoadErrorRoute
> {
  seeds.initialize();
  await seeds.waitForLoad();

  return {
    resource: "home",
    params: {},
  };
}
