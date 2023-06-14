import { describe, expect, test } from "vitest";
import { testExports } from "@app/lib/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("routeToPath", () => {
  test.each([
    { input: { resource: "home" }, output: "/", description: "Home Route" },
    {
      input: {
        resource: "seeds",
        params: { hostAndPort: "willow.radicle.garden" },
      },
      output: "/seeds/willow.radicle.garden",
      description: "Seed View Route",
    },
    {
      input: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          hostAndPort: "willow.radicle.garden",
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        },
      },
      output: "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      description: "Seed Project Route",
    },
  ])("$description", (route: any) => {
    expect(testExports.routeToPath(route.input)).toEqual(route.output);
  });
});

describe("pathToRoute", () => {
  const dummyUrl = "https://localhost";
  test.each([
    {
      input: new URL("/foo/baz/bar", dummyUrl),
      output: null,
      description: "Non existant not found route",
    },
    {
      input: new URL("", dummyUrl),
      output: { resource: "home" },
      description: "Home Route",
    },
    {
      input: new URL("/", dummyUrl),
      output: { resource: "home" },
      description: "Home Route",
    },
    {
      input: new URL("/seeds/willow.radicle.garden", dummyUrl),
      output: {
        resource: "seeds",
        params: { hostAndPort: "willow.radicle.garden", projectPageIndex: 0 },
      },
      description: "Seed View Route",
    },
    {
      input: new URL(
        "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT/",
        dummyUrl,
      ),
      output: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          hostAndPort: "willow.radicle.garden",
          profile: undefined,
          peer: undefined,
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        },
      },
      description: "Seed Project Route w trailing slash",
    },
    {
      input: new URL(
        "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT/nope",
        dummyUrl,
      ),
      output: null,
      description: "Seed Project Route w undefined suffix",
    },
    {
      input: new URL(
        "/seeds/willow.radicle.garden/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        dummyUrl,
      ),
      output: {
        resource: "projects",
        params: {
          view: { resource: "tree" },
          hostAndPort: "willow.radicle.garden",
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
