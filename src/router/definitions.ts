import type { Branches } from "@app/project";

export type Route =
  | { type: "404"; params: { path: string } }
  | { type: "faucet"; params: FaucetParams }
  | { type: "home" }
  | { type: "profile"; params: ProfileParams }
  | { type: "projects"; params: ProjectParams; state: ProjectState }
  | { type: "register" }
  | { type: "registrations"; params: RegistrationsParams }
  | { type: "seeds"; params: SeedParams }
  | { type: "vesting" };

export interface ProjectParams {
  urn: string;
  content: string;
  seedHost: string | null;
  profileName: string | null;
  peer: string | null;
  revision: string | null;
  issue: string | null;
  patch: string | null;
  path: string | null;
  line: number | null;
}

export interface ProjectState {
  branches: Branches | null;
}

export type SeedParams = { host: string };

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
