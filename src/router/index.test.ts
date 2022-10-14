import { describe, expect, test } from "vitest";
import { pathToRoute, routeToPath } from "./index";

const defaultProjectRouteParams = {
  peer: null,
  profileName: null,
  seedHost: null,
  issue: null,
  patch: null,
  path: null,
  line: null,
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
        urn: "rad:git:hnrkbtw9t1of4ykjy6er4qqwxtc54k9943eto",
        content: "tree",
        seedHost: "willow.radicle.garden",
        revision: "a67a075c10ac4155b3188dd8af9ea6c706657425",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        urn: "rad:git:hnrkbtw9t1of4ykjy6er4qqwxtc54k9943eto",
        content: "tree",
        profileName: "cloudhead.eth",
        revision: "a67a075c10ac4155b3188dd8af9ea6c706657425",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        urn: "rad:git:hnrkbtw9t1of4ykjy6er4qqwxtc54k9943eto",
        content: "tree",
        profileName: "cloudhead.eth",
        revision: "a67a075c10ac4155b3188dd8af9ea6c706657425",
      },
    },
    {
      type: "projects",
      params: {
        ...defaultProjectRouteParams,
        urn: "rad:git:hnrkbtw9t1of4ykjy6er4qqwxtc54k9943eto",
        content: "tree",
        profileName: "cloudhead.eth",
        revision: null,
        path: "src/App.svelte",
      },
    },
  ])("$type", (route: any) => {
    expect(pathToRoute(routeToPath(route))).toEqual(route);
  });
});
