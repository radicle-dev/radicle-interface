import { describe, expect, test } from "vitest";
import { pathToRoute, routeToPath } from "./index";

const defaultProjectRouteParams = {
  urn: "rad:git:hnrkbtw9t1of4ykjy6er4qqwxtc54k9943eto",
  content: "tree",
  restRoute: "",
  peer: null,
  profileName: null,
  seedHost: null,
  issue: null,
  patch: null,
};

describe("Route parsing", () => {
  test.each([
    { input: { type: "home" }, description: "Home Route" },
    { input: { type: "vesting" }, description: "Vesting Route" },
    { input: { type: "register" }, description: "Register Route" },
    {
      input: { type: "faucet", params: { type: "form" } },
      description: "Faucet Form Route",
    },
    {
      input: { type: "profile", params: { profileName: "cloudhead.eth" } },
      description: "Profile Route",
    },
    {
      input: { type: "seeds", params: { host: "willow.radicle.garden" } },
      description: "Seed View Route",
    },
    {
      input: {
        type: "registrations",
        params: { nameOrDomain: "sebastinez", owner: null, view: null },
      },
      description: "Registration View Route",
    },
    {
      input: {
        type: "registrations",
        params: { nameOrDomain: "sebastinez", owner: null, view: "form" },
      },
      description: "Registration Form Route",
    },
    {
      input: {
        type: "registrations",
        params: { nameOrDomain: "sebastinez", owner: null, view: "submit" },
      },
      description: "Registration Submit Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          seedHost: "willow.radicle.garden",
        },
      },
      description: "Seed Project Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          peer: "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
          seedHost: "willow.radicle.garden",
        },
      },
      description: "Seed Project With Peer Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          peer: "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
          restRoute: "04aa53a1711ff9deaf9e9da5e896bc9b7d1b3995/src/App.svelte",
          seedHost: "willow.radicle.garden",
        },
      },
      description: "Seed Project With Peer, Oid And Path Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          peer: "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
          restRoute: "master/src/App.svelte",
          seedHost: "willow.radicle.garden",
        },
      },
      description: "Seed Project With Peer, Branch And Path Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          peer: "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
          restRoute: "cloudhead/ci/src/App.svelte",
          seedHost: "willow.radicle.garden",
        },
      },
      description: "Seed Project With Peer, Feature Branch And Path Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          profileName: "cloudhead.eth",
        },
      },
      description: "Profile Project Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          peer: "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
          profileName: "cloudhead.eth",
        },
      },
      description: "Profile Project With Peer Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          restRoute: "04aa53a1711ff9deaf9e9da5e896bc9b7d1b3995/src/App.svelte",
          profileName: "cloudhead.eth",
        },
      },
      description: "Profile Project With Oid And Path Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          restRoute: "master/src/App.svelte",
          profileName: "cloudhead.eth",
        },
      },
      description: "Profile Project With Branch And Path Route",
    },
    {
      input: {
        type: "projects",
        params: {
          ...defaultProjectRouteParams,
          restRoute: "cloudhead/ci/src/App.svelte",
          profileName: "cloudhead.eth",
        },
      },
      description: "Profile Project With Feature Branch And Path Route",
    },
  ])("$description", (route: any) => {
    expect(pathToRoute(routeToPath(route.input))).toEqual(route.input);
  });
});
