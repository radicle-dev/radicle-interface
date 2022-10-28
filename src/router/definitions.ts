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
  | { type: "projects"; params: ProjectsParams }
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
  content?: string;
  hash?: string | null;
  issue?: string | null;
  patch?: string | null;
  path?: string | null;
  peer?: string | null;
  profile?: string | null;
  revision?: string | null;
  route?: string | null;
  search?: string | null;
  seed?: string | null;
  urn: string;
}

export type ProjectRoute = { type: "projects"; params: ProjectsParams };
