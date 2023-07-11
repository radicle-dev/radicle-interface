import { describe, expect, test } from "vitest";
import { testExports, type Route } from "@app/lib/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("route invariant when parsed", () => {
  const origin = "http://localhost:3000";
  const seed = {
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
        baseUrl: seed,
      },
    });
  });
  test("projects.tree", () => {
    expectParsingInvariant({
      resource: "project.tree",
      seed,
      project: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      route: "",
    });
  });

  test("projects.tree with peer", () => {
    expectParsingInvariant({
      resource: "project.tree",
      seed,
      project: "PROJECT",
      peer: "PEER",
      route: "",
    });
  });

  test("projects.tree with peer and revision", () => {
    const route: Route = {
      resource: "project.tree",
      seed,
      project: "PROJECT",
      peer: "PEER",
      revision: "REVISION",
      route: "",
    };
    const path = testExports.routeToPath(route);
    route.revision = undefined;
    route.route = "REVISION";
    expect(testExports.pathToRoute(new URL(path, origin))).toEqual(route);
  });

  test("projects.tree with peer and revision and path", () => {
    const route: Route = {
      resource: "project.tree",
      seed,
      project: "PROJECT",
      peer: "PEER",
      path: "PATH",
      revision: "REVISION",
      route: "",
    };
    const path = testExports.routeToPath(route);
    route.revision = undefined;
    route.path = undefined;
    route.route = "REVISION/PATH";
    expect(testExports.pathToRoute(new URL(path, origin))).toEqual(route);
  });

  test("projects.history", () => {
    expectParsingInvariant({
      resource: "project.history",
      seed,
      project: "PROJECT",
      revision: "",
    });
  });

  test("projects.history with revision", () => {
    expectParsingInvariant({
      resource: "project.history",
      seed,
      project: "PROJECT",
      revision: "REVISION",
    });
  });

  test("projects.commits", () => {
    expectParsingInvariant({
      resource: "project.commit",
      seed,
      project: "PROJECT",
      commit: "COMMIT",
    });
  });

  test("projects.issues", () => {
    expectParsingInvariant({
      resource: "project.issues",
      seed,
      project: "PROJECT",
      search: "",
    });
  });

  test("projects.issues with search", () => {
    expectParsingInvariant({
      resource: "project.issues",
      seed,
      project: "PROJECT",
      search: "SEARCH",
    });
  });

  test("projects.newIssue", () => {
    expectParsingInvariant({
      resource: "project.newIssue",
      seed,
      project: "PROJECT",
    });
  });

  test("projects.issue", () => {
    expectParsingInvariant({
      resource: "project.issue",
      seed,
      project: "PROJECT",
      issue: "ISSUE",
    });
  });

  test("projects.patches"),
    () => {
      expectParsingInvariant({
        resource: "project.patches",
        seed,
        project: "PROJECT",
      });
    };

  test("projects.patches with search", () => {
    expectParsingInvariant({
      resource: "project.patches",
      seed,
      project: "PROJECT",
      search: "SEARCH",
    });
  });

  test("projects.patch", () => {
    expectParsingInvariant({
      resource: "project.patch",
      seed,
      project: "PROJECT",
      patch: "PATCH",
      search: "",
    });
  });

  test("projects.patch with revision", () => {
    expectParsingInvariant({
      resource: "project.patch",
      seed,
      project: "PROJECT",
      patch: "PATCH",
      search: "",
      revision: "REVISION",
    });
  });

  test("projects.patch with search", () => {
    expectParsingInvariant({
      resource: "project.patch",
      seed,
      project: "PROJECT",
      patch: "PATCH",
      search: "SEARCH",
    });
  });

  test("projects.patch with revision and search", () => {
    expectParsingInvariant({
      resource: "project.patch",
      seed,
      project: "PROJECT",
      patch: "PATCH",
      revision: "REVISION",
      search: "SEARCH",
    });
  });

  function expectParsingInvariant(route: Route) {
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
        resource: "project.tree",
        seed: {
          hostname: "willow.radicle.garden",
          scheme: "http",
          port: 8080,
        },
        project: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        route: "",
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
        resource: "project.tree",
        seed: {
          hostname: "willow.radicle.garden",
          scheme: "http",
          port: 8080,
        },
        project: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        route: "",
      },
      description: "Seed Project Route w/o trailing slash",
    },
  ])("$description", (route: any) => {
    expect(testExports.pathToRoute(route.input)).toEqual(route.output);
  });
});
