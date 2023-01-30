import { describe, expect, test } from "vitest";
import { routeToPath } from "@app/lib/router";
import { testExports } from "@app/lib/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("routeToPath", () => {
  test.each([
    { input: { resource: "home" }, output: "/", description: "Home Route" },
    {
      input: { resource: "seeds", params: { host: "willow.radicle.garden" } },
      output: "/seeds/willow.radicle.garden",
      description: "Seed View Route",
    },
    {
      input: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          seed: "willow.radicle.garden",
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        },
      },
      output:
        "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT/tree",
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
      input: "/seeds/willow.radicle.garden",
      output: { resource: "seeds", params: { host: "willow.radicle.garden" } },
      description: "Seed View Route",
    },
    {
      input: "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      output: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          seed: "willow.radicle.garden",
          profile: undefined,
          peer: undefined,
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        },
      },
      description: "Seed Project Route",
    },
  ])("$description", (route: any) => {
    expect(testExports.pathToRoute(route.input)).toEqual(route.output);
  });
});
