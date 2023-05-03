import { describe, expect, test } from "vitest";
import { routeToPath } from "@app/lib/router";
import { testExports } from "@app/lib/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("routeToPath", () => {
  test.each([
    { input: { resource: "home" }, output: "/", description: "Home Route" },
    {
      input: {
        resource: "seeds",
        params: { hostnamePort: "willow.radicle.garden" },
      },
      output: "/seeds/willow.radicle.garden",
      description: "Seed View Route",
    },
    {
      input: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          hostnamePort: "willow.radicle.garden",
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        },
      },
      output: "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      description: "Seed Project Route",
    },
  ])("$description", (route: any) => {
    expect(routeToPath(route.input)).toEqual(route.output);
  });
});

describe("pathToRoute", () => {
  test.each([
    { input: "", output: null, description: "Empty not found Route" },
    {
      input: "/foo/baz/bar",
      output: null,
      description: "Non existant not found oute",
    },
    { input: "/", output: { resource: "home" }, description: "Home Route" },
    {
      input: "/seeds/willow.radicle.garden",
      output: {
        resource: "seeds",
        params: { hostnamePort: "willow.radicle.garden", projectPageIndex: 0 },
      },
      description: "Seed View Route",
    },
    {
      input: "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT/",
      output: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          hostnamePort: "willow.radicle.garden",
          profile: undefined,
          peer: undefined,
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        },
      },
      description: "Seed Project Route w trailing slash",
    },
    {
      input:
        "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT/nope",
      output: null,
      description: "Seed Project Route w undefined suffix",
    },
    {
      input: "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      output: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          hostnamePort: "willow.radicle.garden",
          profile: undefined,
          peer: undefined,
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        },
      },
      description: "Seed Project Route w/o trailing slash",
    },
  ])("$description", (route: any) => {
    expect(testExports.pathToRoute(route.input)).toEqual(route.output);
  });
});
