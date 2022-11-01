export type Route =
  | { type: "404" }
  | {
      type: "faucet";
      params: {
        activeView:
          | { type: "form" }
          | { type: "withdraw"; params: { amount: string | null } };
      };
    }
  | { type: "home" }
  | { type: "boot" }
  | { type: "profile"; params: { addressOrName: string } }
  | ProjectRoute
  | {
      type: "registration";
      params: {
        activeView:
          | {
              type: "validateName";
            }
          | {
              type: "checkNameAvailability";
              params: { nameOrDomain: string; owner: string | null };
            }
          | {
              type: "register";
              params: { nameOrDomain: string; owner: string | null };
            }
          | {
              type: "view";
              params: { nameOrDomain: string; retry: boolean };
            };
      };
    }
  | { type: "seeds"; params: { host: string } }
  | { type: "vesting" };

export interface ProjectsParams {
  urn: string;
  activeView:
    | { type: "tree" }
    | { type: "commit" }
    | { type: "commits" }
    | { type: "issue"; params: { issue: string } }
    | { type: "issues" }
    | { type: "patch"; params: { patch: string } }
    | { type: "patches" };
  hash?: string;
  path?: string;
  peer?: string;
  profile?: string;
  revision?: string;
  route?: string;
  search?: string;
  seed?: string;
}

export type ProjectRoute = { type: "projects"; params: ProjectsParams };
