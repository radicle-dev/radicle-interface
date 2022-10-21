import { describe, expect, test } from "vitest";
import { pathToRoute, routeToPath } from "./index";

describe("routeToPath", () => {
  test.each([
    { input: { type: "home" }, output: "/", description: "Home Route" },
    {
      input: { type: "vesting" },
      output: "/vesting",
      description: "Vesting Route",
    },
    {
      input: { type: "faucet", params: { activeView: "form", amount: null } },
      output: "/faucet",
      description: "Faucet Form Route",
    },
    {
      input: { type: "profile", params: { addressOrName: "cloudhead.eth" } },
      output: "/cloudhead.eth",
      description: "Profile Route",
    },
    {
      input: { type: "seeds", params: { host: "willow.radicle.garden" } },
      output: "/seeds/willow.radicle.garden",
      description: "Seed View Route",
    },
    {
      input: {
        type: "registrations",
        params: {
          nameOrDomain: null,
          owner: null,
          activeView: null,
          retry: false,
        },
      },
      output: "/registrations",
      description: "Registration Index Route",
    },
    {
      input: {
        type: "registrations",
        params: {
          nameOrDomain: "sebastinez",
          owner: null,
          activeView: null,
          retry: false,
        },
      },
      output: "/registrations/sebastinez",
      description: "Registration View Route",
    },
    {
      input: {
        type: "registrations",
        params: {
          nameOrDomain: "sebastinez",
          owner: null,
          activeView: "form",
          retry: false,
        },
      },
      output: "/registrations/sebastinez/form",
      description: "Registration Form Route",
    },
    {
      input: {
        type: "registrations",
        params: {
          nameOrDomain: "sebastinez",
          owner: null,
          activeView: "submit",
          retry: false,
        },
      },
      output: "/registrations/sebastinez/submit",
      description: "Registration Submit Route",
    },
    {
      input: {
        type: "projects",
        params: {
          seed: "willow.radicle.garden",
          urn: "rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
        },
      },
      output:
        "/seeds/willow.radicle.garden/rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
      description: "Seed Project Route",
    },
  ])("$description", (route: any) => {
    expect(routeToPath(route.input)).toEqual(route.output);
  });
});

describe("pathToRoute", () => {
  test.each([
    { input: "/", output: { type: "home" }, description: "Home Route" },
    {
      input: "/vesting",
      output: { type: "vesting" },
      description: "Vesting Route",
    },
    {
      input: "/faucet",
      output: { type: "faucet", params: { activeView: "form", amount: null } },
      description: "Faucet Form Route",
    },
    {
      input: "/faucet/withdraw?amount=10",
      output: {
        type: "faucet",
        params: { activeView: "withdraw", amount: "10" },
      },
      description: "Faucet Withdraw Route",
    },
    {
      input: "/cloudhead.eth",
      output: { type: "profile", params: { addressOrName: "cloudhead.eth" } },
      description: "Profile Route",
    },
    {
      input: "/seeds/willow.radicle.garden",
      output: { type: "seeds", params: { host: "willow.radicle.garden" } },
      description: "Seed View Route",
    },
    {
      input: "/registrations",
      output: {
        type: "registrations",
        params: {
          nameOrDomain: null,
          owner: null,
          activeView: null,
          retry: false,
        },
      },
      description: "Registration Index Route",
    },
    {
      input: "/registrations/sebastinez",
      output: {
        type: "registrations",
        params: {
          nameOrDomain: "sebastinez",
          owner: null,
          activeView: null,
          retry: false,
        },
      },
      description: "Registration View Route",
    },
    {
      input: "/registrations/sebastinez/form",
      output: {
        type: "registrations",
        params: {
          nameOrDomain: "sebastinez",
          owner: null,
          activeView: "form",
          retry: false,
        },
      },
      description: "Registration Form Route",
    },
    {
      input: "/registrations/sebastinez/submit",
      output: {
        type: "registrations",
        params: {
          nameOrDomain: "sebastinez",
          owner: null,
          activeView: "submit",
          retry: false,
        },
      },
      description: "Registration Submit Route",
    },
    {
      input:
        "/seeds/willow.radicle.garden/rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
      output: {
        type: "projects",
        params: {
          seed: "willow.radicle.garden",
          content: "tree",
          profile: null,
          peer: null,
          urn: "rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
        },
      },
      description: "Seed Project Route",
    },
  ])("$description", (route: any) => {
    expect(pathToRoute(route.input)).toEqual(route.output);
  });
});
