import { describe, expect, test } from "vitest";
import { routeToPath } from "@app/router/index";
import { testExports } from "@app/router/index";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("routeToPath", () => {
  test.each([
    { input: { resource: "home" }, output: "/", description: "Home Route" },
    {
      input: { resource: "vesting", params: { view: { resource: "form" } } },
      output: "/vesting",
      description: "Vesting Route",
    },
    {
      input: { resource: "faucet", params: { view: { resource: "form" } } },
      output: "/faucet",
      description: "Faucet Form Route",
    },
    {
      input: {
        resource: "profile",
        params: { addressOrName: "cloudhead.eth" },
      },
      output: "/cloudhead.eth",
      description: "Profile Route",
    },
    {
      input: { resource: "seeds", params: { host: "willow.radicle.garden" } },
      output: "/seeds/willow.radicle.garden",
      description: "Seed View Route",
    },
    {
      input: {
        resource: "registrations",
        params: {
          view: { resource: "validateName" },
        },
      },
      output: "/registrations",
      description: "registrations Index Route",
    },
    {
      input: {
        resource: "registrations",
        params: {
          view: {
            resource: "view",
            params: { nameOrDomain: "sebastinez", retry: true },
          },
        },
      },
      output: "/registrations/sebastinez?retry=true",
      description: "registrations View Route",
    },
    {
      input: {
        resource: "registrations",
        params: {
          view: {
            resource: "view",
            params: { nameOrDomain: "sebastinez", retry: false },
          },
        },
      },
      output: "/registrations/sebastinez?retry=false",
      description: "registrations View Route",
    },
    {
      input: {
        resource: "registrations",
        params: {
          view: {
            resource: "checkNameAvailability",
            params: {
              nameOrDomain: "sebastinez",
            },
          },
        },
      },
      output: "/registrations/sebastinez/checkNameAvailability",
      description: "registrations Form Route",
    },
    {
      input: {
        resource: "registrations",
        params: {
          view: {
            resource: "register",
            params: { nameOrDomain: "sebastinez" },
          },
        },
      },
      output: "/registrations/sebastinez/register",
      description: "registrations Submit Route",
    },
    {
      input: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          seed: "willow.radicle.garden",
          urn: "rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
        },
      },
      output:
        "/seeds/willow.radicle.garden/rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao/tree",
      description: "Seed Project Route",
    },
  ])("$description", (route: any) => {
    expect(routeToPath(route.input)).toEqual(route.output);
  });
});

describe("pathToRoute", () => {
  test.each([
    { input: "", output: null, description: "Empty 404 Route" },
    {
      input: "/foo/baz/bar",
      output: null,
      description: "Non existant 404 Route",
    },
    { input: "/", output: { resource: "home" }, description: "Home Route" },
    {
      input: "/vesting",
      output: { resource: "vesting", params: { view: { resource: "form" } } },
      description: "Vesting Route",
    },
    {
      input: "/faucet",
      output: { resource: "faucet", params: { view: { resource: "form" } } },
      description: "Faucet Form Route",
    },
    {
      input: "/faucet/withdraw?amount=10",
      output: {
        resource: "faucet",
        params: { view: { resource: "withdraw", params: { amount: "10" } } },
      },
      description: "Faucet Withdraw Route",
    },
    {
      input: "/cloudhead.eth",
      output: {
        resource: "profile",
        params: { addressOrName: "cloudhead.eth" },
      },
      description: "Profile Route",
    },
    {
      input: "/seeds/willow.radicle.garden",
      output: { resource: "seeds", params: { host: "willow.radicle.garden" } },
      description: "Seed View Route",
    },
    {
      input: "/registrations",
      output: {
        resource: "registrations",
        params: {
          view: { resource: "validateName" },
        },
      },
      description: "registrations Index Route",
    },
    {
      input: "/registrations/sebastinez",
      output: {
        resource: "registrations",
        params: {
          view: {
            resource: "view",
            params: { nameOrDomain: "sebastinez", retry: false },
          },
        },
      },
      description: "registrations View Route",
    },
    {
      input: "/registrations/sebastinez?retry=true",
      output: {
        resource: "registrations",
        params: {
          view: {
            resource: "view",
            params: { nameOrDomain: "sebastinez", retry: true },
          },
        },
      },
      description: "registrations View Route",
    },
    {
      input: "/registrations/sebastinez/checkNameAvailability",
      output: {
        resource: "registrations",
        params: {
          view: {
            resource: "checkNameAvailability",
            params: {
              nameOrDomain: "sebastinez",
              owner: null,
            },
          },
        },
      },
      description: "registrations Form Route",
    },
    {
      input: "/registrations/sebastinez/register",
      output: {
        resource: "registrations",
        params: {
          view: {
            resource: "register",
            params: { nameOrDomain: "sebastinez", owner: null },
          },
        },
      },
      description: "registrations Submit Route",
    },
    {
      input:
        "/seeds/willow.radicle.garden/rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
      output: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          seed: "willow.radicle.garden",
          profile: undefined,
          peer: undefined,
          urn: "rad:git:hnrkmg77m8tfzj4gi4pa4mbhgysfgzwntjpao",
        },
      },
      description: "Seed Project Route",
    },
  ])("$description", (route: any) => {
    expect(testExports.pathToRoute(route.input)).toEqual(route.output);
  });
});
