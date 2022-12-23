import type { VestingInfo } from "@app/lib/vesting";

export type Route =
  | ProjectRoute
  | RegistrationRoute
  | VestingRoute
  | { resource: "faucet" }
  | { resource: "home" }
  | { resource: "404"; params: { url: string } }
  | { resource: "profile"; params: { addressOrName: string } }
  | { resource: "seeds"; params: { host: string } };

export interface ProjectsParams {
  id: string;
  view:
    | { resource: "tree" }
    | { resource: "commits" }
    | { resource: "history" }
    | { resource: "issue"; params: { issue: string } }
    | { resource: "issues" }
    | { resource: "patch"; params: { patch: string } }
    | { resource: "patches" };
  hash?: string;
  line?: string;
  path?: string;
  peer?: string;
  profile?: string;
  revision?: string;
  route?: string;
  search?: string;
  seed?: string;
}

export interface VestingParams {
  view:
    | { resource: "form" }
    | { resource: "view"; params: { contract: string; info?: VestingInfo } };
}

export interface RegistrationParams {
  view:
    | {
        resource: "form";
      }
    | {
        resource: "view";
        params: { nameOrDomain: string; retry: boolean };
      };
}

export type ProjectRoute = { resource: "projects"; params: ProjectsParams };
export type VestingRoute = { resource: "vesting"; params: VestingParams };
export type RegistrationRoute = {
  resource: "registrations";
  params: RegistrationParams;
};
