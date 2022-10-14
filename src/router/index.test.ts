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
    { type: "home" },
    { type: "vesting" },
    { type: "register" },
    { type: "faucet", params: { type: "form" } },
    { type: "profile", params: { profileName: "cloudhead.eth" } },
    { type: "profile", params: { profileName: "cloudhead.eth" } },
    { type: "seeds", params: { host: "willow.radicle.garden" } },
    {
      type: "registrations",
      params: { nameOrDomain: "sebastinez", owner: null, view: null },
    },
    {
      type: "registrations",
      params: { nameOrDomain: "sebastinez", owner: null, view: "form" },
    },
    {
      type: "registrations",
      params: { nameOrDomain: "sebastinez", owner: null, view: "submit" },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        seedHost: "willow.radicle.garden",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        profileName: "cloudhead.eth",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        peer: "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
        profileName: "cloudhead.eth",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        restRoute: "04aa53a1711ff9deaf9e9da5e896bc9b7d1b3995/src/App.svelte",
        profileName: "cloudhead.eth",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        restRoute: "master/src/App.svelte",
        profileName: "cloudhead.eth",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        restRoute: "cloudhead/ci/src/App.svelte",
        profileName: "cloudhead.eth",
      },
    },
  ])("$type", (route: any) => {
    const path = routeToPath(route);
    console.log(path);
    expect(pathToRoute(path)).toEqual(route);
  });
});
