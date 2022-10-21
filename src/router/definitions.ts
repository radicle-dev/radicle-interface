export type Route =
  | FaucetRoute
  | ProjectRoute
  | RegistrationRoute
  | { resource: "home" }
  | { resource: "404"; params: { url: string } }
  | { resource: "profile"; params: { addressOrName: string } }
  | { resource: "seeds"; params: { host: string } }
  | { resource: "vesting" };

export interface ProjectsParams {
  urn: string;
  view:
    | { resource: "tree" }
    | { resource: "commits" }
    | { resource: "history" }
    | { resource: "issue"; params: { issue: string } }
    | { resource: "issues" }
    | { resource: "patch"; params: { patch: string } }
    | { resource: "patches" };
  hash?: string;
  path?: string;
  peer?: string;
  profile?: string;
  revision?: string;
  route?: string;
  search?: string;
  seed?: string;
}

export interface FaucetParams {
  view:
    | { resource: "form" }
    | { resource: "withdraw"; params: { amount: string | null } };
}

export interface RegistrationParams {
  view:
    | {
        resource: "validateName";
      }
    | {
        resource: "checkNameAvailability";
        params: { nameOrDomain: string; owner: string | null };
      }
    | {
        resource: "register";
        params: { nameOrDomain: string; owner: string | null };
      }
    | {
        resource: "view";
        params: { nameOrDomain: string; retry: boolean };
      };
}

export type ProjectRoute = { resource: "projects"; params: ProjectsParams };
export type FaucetRoute = { resource: "faucet"; params: FaucetParams };
export type RegistrationRoute = {
  resource: "registrations";
  params: RegistrationParams;
};
