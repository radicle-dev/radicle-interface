import { describe, expect, test } from "vitest";
import { testExports, type Route } from "@app/lib/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("route invariant when parsed", () => {
  const origin = "http://localhost:3000";
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
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: { resource: "tree" },
        baseUrl,
        id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      },
    });
  });

  test("projects.tree with peer", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: { resource: "tree" },
        baseUrl,
        id: "PROJECT",
        peer: "PEER",
        route: "",
      },
    });
  });

  test("projects.tree with peer and revision", () => {
    const route: Route = {
      resource: "projects",
      params: {
        view: { resource: "tree" },
        baseUrl,
        id: "PROJECT",
        peer: "PEER",
        revision: "REVISION",
        route: "",
      },
    };
    const path = testExports.routeToPath(route);
    route.params.revision = undefined;
    route.params.route = "REVISION";
    expect(testExports.pathToRoute(new URL(path, origin))).toEqual(route);
  });

  test("projects.tree with peer and revision and path", () => {
    const route: Route = {
      resource: "projects",
      params: {
        view: { resource: "tree" },
        baseUrl,
        id: "PROJECT",
        peer: "PEER",
        path: "PATH",
        revision: "REVISION",
        route: "",
      },
    };
    const path = testExports.routeToPath(route);
    route.params.revision = undefined;
    route.params.path = undefined;
    route.params.route = "REVISION/PATH";
    expect(testExports.pathToRoute(new URL(path, origin))).toEqual(route);
  });

  test("projects.history", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: { resource: "history" },
        baseUrl,
        id: "PROJECT",
        route: "",
      },
    });
  });

  test("projects.history with revision", () => {
    const route: Route = {
      resource: "projects",
      params: {
        view: { resource: "history" },
        baseUrl,
        id: "PROJECT",
        peer: "PEER",
        revision: "REVISION",
      },
    };
    const path = testExports.routeToPath(route);
    route.params.revision = undefined;
    route.params.route = "REVISION";
    expect(testExports.pathToRoute(new URL(path, origin))).toEqual(route);
  });

  test("projects.commits", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: { resource: "commits", commitId: "COMMIT" },
        baseUrl,
        id: "PROJECT",
        peer: "PEER",
      },
    });
  });

  test("projects.issues", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "issues",
          params: { view: { resource: "list" }, search: "" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.issues with search", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "issues",
          params: { view: { resource: "list" }, search: "SEARCH" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.issues.new", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "issues",
          params: { view: { resource: "new" }, search: "" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.issue", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "issue",
          params: { issue: "ISSUE" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.patches"),
    () => {
      expectParsingInvariant({
        resource: "projects",
        params: {
          view: {
            resource: "patches",
            params: { view: { resource: "list" }, search: "" },
          },
          baseUrl,
          id: "PROJECT",
        },
      });
    };

  test("projects.patches with search", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "patches",
          params: { view: { resource: "list" }, search: "SEARCH" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.patch", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "patch",
          params: { patch: "PATCH", search: "" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.patch with revision", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "patch",
          params: { patch: "PATCH", search: "", revision: "REVISION" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.patch with search", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "patch",
          params: { patch: "PATCH", search: "SEARCH" },
        },
        baseUrl,
        id: "PROJECT",
      },
    });
  });

  test("projects.patch with revision and search", () => {
    expectParsingInvariant({
      resource: "projects",
      params: {
        view: {
          resource: "patch",
          params: { patch: "PATCH", search: "SEARCH", revision: "REVISION" },
        },
        baseUrl,
        id: "PROJECT",
      },
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
