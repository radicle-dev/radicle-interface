import type { VestingInfo } from "@app/base/vesting/vesting";

export type Route =
  | {
      resource: "faucet";
      params: {
        view:
          | { resource: "form" }
          | { resource: "withdraw"; params: { amount: string | null } };
      };
    }
  | {
      resource: "projects";
      params: {
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
        line?: string;
        path?: string;
        peer?: string;
        profile?: string;
        revision?: string;
        route?: string;
        search?: string;
        seed?: string;
      };
    }
  | {
      resource: "registrations";
      params: {
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
      };
    }
  | {
      resource: "vesting";
      params: {
        view:
          | { resource: "form" }
          | {
              resource: "view";
              params: { contract: string; info?: VestingInfo };
            };
      };
    }
  | { resource: "home" }
  | { resource: "404"; params: { url: string } }
  | { resource: "profile"; params: { addressOrName: string } }
  | { resource: "seeds"; params: { host: string } };

export type ProjectsParams = Extract<Route, { resource: "projects" }>["params"];
export type VestingParams = Extract<Route, { resource: "vesting" }>["params"];
export type FaucetParams = Extract<Route, { resource: "faucet" }>["params"];
export type RegistrationParams = Extract<
  Route,
  { resource: "registrations" }
>["params"];

export type ProjectRoute = Extract<Route, { resource: "projects" }>;
export type FaucetRoute = Extract<Route, { resource: "faucet" }>;
export type VestingRoute = Extract<Route, { resource: "vesting" }>;
export type RegistrationRoute = Extract<Route, { resource: "registrations" }>;
