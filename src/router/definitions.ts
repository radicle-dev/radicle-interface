export type Route =
  | { type: "404"; params: NotFoundParams }
  | { type: "faucet"; params: FaucetParams }
  | { type: "home" }
  | { type: "profile"; params: ProfileParams }
  | { type: "projects"; params: ProjectParams }
  | { type: "register" }
  | { type: "registrations"; params: RegistrationsParams }
  | { type: "seeds"; params: SeedParams }
  | { type: "vesting" };

export interface ProjectParams {
  urn: string;
  content: string;
  restRoute: string;
  seedHost: string | null;
  profileName: string | null;
  peer: string | null;
  issue: string | null;
  patch: string | null;
}

export type Params =
  | NotFoundParams
  | SeedParams
  | ProfileParams
  | ProjectParams
  | RegistrationsParams;

export type SeedParams = { host: string };
export type NotFoundParams = { path: string };

export type FaucetParams =
  | { type: "form" }
  | { type: "withdraw"; amount: string };

export interface ProfileParams {
  profileName: string;
}

export interface RegistrationsParams {
  nameOrDomain: string;
  view: string | null;
  owner: string | null;
}
