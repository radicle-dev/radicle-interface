import { describe, expect, test } from "vitest";
import { testExports, type Route } from "@app/lib/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("route invariant when parsed", () => {
  const baseUrl = {
    hostname: "willow.radicle.garden",
    port: 8000,
    scheme: "http",
  };

  test("home", () => {
    return expectParsingInvariant({ resource: "home" });
  });
  test("seeds", () => {
    expectParsingInvariant({
      resource: "seeds",
      params: {
        // TODO: This only works with the value 0. The value is not actually
        // extract.
        projectPageIndex: 0,
        baseUrl,
      },
    });
  });
  test("projects.tree", () => {
    return expectParsingInvariant({
      resource: "projects",
      params: {
        view: { resource: "tree" },
        baseUrl,
        id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      },
    });
  });

  function expectParsingInvariant(route: Route) {
    const origin = "http://localhost:3000";
    const path = testExports.routeToPath(route);
    expect(testExports.pathToRoute(new URL(path, origin))).toEqual(route);
  }
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
        params: {
          baseUrl: {
            hostname: "willow.radicle.garden",
            scheme: "http",
            port: 8080,
          },
          projectPageIndex: 0,
        },
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
          baseUrl: {
            hostname: "willow.radicle.garden",
            scheme: "http",
            port: 8080,
          },
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
          baseUrl: {
            hostname: "willow.radicle.garden",
            scheme: "http",
            port: 8080,
          },
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
