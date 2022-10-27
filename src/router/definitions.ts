export type Route =
  | { type: "404" }
  | {
      type: "faucet";
      params: {
        activeView: FaucetRoute;
      };
    }
  | { type: "home" }
  | { type: "boot" }
  | { type: "profile"; params: { addressOrName: string } }
  | { type: "projects"; params: ProjectsParams }
  | { type: "registration"; params: RegistrationParams }
  | { type: "seeds"; params: { host: string } }
  | { type: "vesting" };

export type FaucetRoute =
  | { type: "form" }
  | { type: "withdraw"; params: { amount: string | null } };

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

export interface RegistrationParams {
  nameOrDomain: string | null;
  activeView: string | null;
  owner: string | null;
  retry: boolean;
}
