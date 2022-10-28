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
      input: { type: "faucet", params: { activeView: { type: "form" } } },
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
        type: "registration",
        params: {
          activeView: { type: "validateName" },
        },
      },
      output: "/registration",
      description: "Registration Index Route",
    },
    {
      input: {
        type: "registration",
        params: {
          activeView: {
            type: "view",
            params: { nameOrDomain: "sebastinez", retry: true },
          },
        },
      },
      output: "/registration/sebastinez?retry=true",
      description: "Registration View Route",
    },
    {
      input: {
        type: "registration",
        params: {
          activeView: {
            type: "view",
            params: { nameOrDomain: "sebastinez", retry: false },
          },
        },
      },
      output: "/registration/sebastinez?retry=false",
      description: "Registration View Route",
    },
    {
      input: {
        type: "registration",
        params: {
          activeView: {
            type: "checkNameAvailability",
            params: {
              nameOrDomain: "sebastinez",
            },
          },
        },
      },
      output: "/registration/sebastinez/checkNameAvailability",
      description: "Registration Form Route",
    },
    {
      input: {
        type: "registration",
        params: {
          activeView: {
            type: "register",
            params: { nameOrDomain: "sebastinez" },
          },
        },
      },
      output: "/registration/sebastinez/register",
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
      output: { type: "faucet", params: { activeView: { type: "form" } } },
      description: "Faucet Form Route",
    },
    {
      input: "/faucet/withdraw?amount=10",
      output: {
        type: "faucet",
        params: { activeView: { type: "withdraw", params: { amount: "10" } } },
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
      input: "/registration",
      output: {
        type: "registration",
        params: {
          activeView: { type: "validateName" },
        },
      },
      description: "Registration Index Route",
    },
    {
      input: "/registration/sebastinez",
      output: {
        type: "registration",
        params: {
          activeView: {
            type: "view",
            params: { nameOrDomain: "sebastinez", retry: false },
          },
        },
      },
      description: "Registration View Route",
    },
    {
      input: "/registration/sebastinez?retry=true",
      output: {
        type: "registration",
        params: {
          activeView: {
            type: "view",
            params: { nameOrDomain: "sebastinez", retry: true },
          },
        },
      },
      description: "Registration View Route",
    },
    {
      input: "/registration/sebastinez/checkNameAvailability",
      output: {
        type: "registration",
        params: {
          activeView: {
            type: "checkNameAvailability",
            params: {
              nameOrDomain: "sebastinez",
              owner: null,
            },
          },
        },
      },
      description: "Registration Form Route",
    },
    {
      input: "/registration/sebastinez/register",
      output: {
        type: "registration",
        params: {
          activeView: {
            type: "register",
            params: { nameOrDomain: "sebastinez", owner: null },
          },
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
