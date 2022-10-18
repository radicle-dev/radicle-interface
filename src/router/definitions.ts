import * as projectRoute from "@app/base/projects/route";
import * as seedRoute from "@app/base/seeds/route";
import * as faucetRoute from "@app/base/faucet/route";
import * as registrationsRoute from "@app/base/registrations/route";
import * as profileRoute from "@app/base/profiles/route";
import type { Config } from "@app/config";

export type Route =
  | { type: "404"; params: { path: string } }
  | { type: "faucet"; params: faucetRoute.Params }
  | { type: "home" }
  | { type: "loading" }
  | { type: "profile"; params: profileRoute.Params }
  | { type: "projects"; params: projectRoute.Params }
  | { type: "registrations"; params: registrationsRoute.Params }
  | { type: "seeds"; params: seedRoute.Params }
  | { type: "vesting" };

export type LoadedRoute =
  | { type: "loading" }
  | { type: "home" }
  | { type: "vesting" }
  | profileRoute.LoadedRoute
  | registrationsRoute.LoadedRoute
  | faucetRoute.LoadedRoute
  | seedRoute.LoadedRoute
  | projectRoute.LoadedRoute;

export async function loadRoute(route: Route, config: Config): Promise<any> {
  switch (route.type) {
    case "projects":
      return projectRoute.load(route.params, config);
    case "seeds":
      return seedRoute.load(route.params, config);
    case "faucet":
      return faucetRoute.load(route.params);
    case "registrations":
      return registrationsRoute.load(route.params);
    case "profile":
      return profileRoute.load(route.params, config);
    default:
      return { type: route.type };
  }
}
