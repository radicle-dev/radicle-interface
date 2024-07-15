import { defaultHttpdPort } from "@tests/support/fixtures.js";
import { describe, expect, test } from "vitest";
import { testExports, type Route } from "@app/lib/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("route invariant when parsed", () => {
  const origin = "http://localhost:3000";
  const node = {
    hostname: "example.node.tld",
    port: 8000,
    scheme: "http",
  };

  test("home", () => {
    return expectParsingInvariant({ resource: "home" });
  });
  test("nodes", () => {
    expectParsingInvariant({
      resource: "nodes",
      params: {
        // TODO: This only works with the value 0. The value is not actually
        // extract.
        projectPageIndex: 0,
        baseUrl: node,
      },
    });
  });
  test("projects.tree", () => {
    expectParsingInvariant({
      resource: "project.source",
      node,
      project: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      route: "",
    });
  });

  test("projects.tree with peer", () => {
    expectParsingInvariant({
      resource: "project.source",
      node,
      project: "PROJECT",
      peer: "PEER",
      route: "",
    });
  });

  test("projects.tree with peer and revision", () => {
    const route: Route = {
      resource: "project.source",
      node,
      project: "PROJECT",
      peer: "PEER",
      revision: "REVISION",
      route: "",
    };
    const path = testExports.routeToPath(route);
    route.revision = undefined;
    route.route = "REVISION";
    expect(testExports.urlToRoute(new URL(path, origin))).toEqual(route);
  });

  test("projects.tree with peer and revision and path", () => {
    const route: Route = {
      resource: "project.source",
      node,
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
    expect(testExports.urlToRoute(new URL(path, origin))).toEqual(route);
  });

  test("projects.history", () => {
    expectParsingInvariant({
      resource: "project.history",
      node,
      project: "PROJECT",
      revision: "",
    });
  });

  test("projects.history with revision", () => {
    expectParsingInvariant({
      resource: "project.history",
      node,
      project: "PROJECT",
      revision: "REVISION",
    });
  });

  test("projects.commits", () => {
    expectParsingInvariant({
      resource: "project.commit",
      node,
      project: "PROJECT",
      commit: "COMMIT",
    });
  });

  test("projects.issues", () => {
    expectParsingInvariant({
      resource: "project.issues",
      node,
      project: "PROJECT",
    });
  });

  test("projects.issues with status", () => {
    expectParsingInvariant({
      resource: "project.issues",
      node,
      project: "PROJECT",
      status: "closed",
    });
  });

  test("projects.issue", () => {
    expectParsingInvariant({
      resource: "project.issue",
      node,
      project: "PROJECT",
      issue: "ISSUE",
    });
  });

  test("projects.patches"),
    () => {
      expectParsingInvariant({
        resource: "project.patches",
        node,
        project: "PROJECT",
      });
    };

  test("projects.patches with search", () => {
    expectParsingInvariant({
      resource: "project.patches",
      node,
      project: "PROJECT",
      search: "SEARCH",
    });
  });

  test("projects.patch default view", () => {
    expectParsingInvariant({
      resource: "project.patch",
      node,
      project: "PROJECT",
      patch: "PATCH",
    });
  });

  test("projects.patch activity", () => {
    expectParsingInvariant({
      resource: "project.patch",
      node,
      project: "PROJECT",
      patch: "PATCH",
      view: { name: "activity" },
    });
  });

  test("projects.patch changes", () => {
    expectParsingInvariant({
      resource: "project.patch",
      node,
      project: "PROJECT",
      patch: "PATCH",
      view: { name: "changes" },
    });
  });

  test("projects.patch changes with revision", () => {
    expectParsingInvariant({
      resource: "project.patch",
      node,
      project: "PROJECT",
      patch: "PATCH",
      view: { name: "changes", revision: "REVISION" },
    });
  });

  test("projects.patch diff", () => {
    expectParsingInvariant({
      resource: "project.patch",
      node,
      project: "PROJECT",
      patch: "PATCH",
      view: {
        name: "diff",
        fromCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        toCommit: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      },
    });
  });

  function expectParsingInvariant(route: Route) {
    const path = testExports.routeToPath(route);
    expect(testExports.urlToRoute(new URL(path, origin))).toEqual(route);
  }
});

describe("pathToRoute", () => {
  test("non-existent", () => {
    expectPathToRoute("/foo/baz/bar", null);
  });

  test("home", () => {
    expectPathToRoute("", { resource: "home" });
    expectPathToRoute("/", { resource: "home" });
  });

  test("nodes", () => {
    expectPathToRoute("/nodes/example.node.tld", {
      resource: "nodes",
      params: {
        baseUrl: {
          hostname: "example.node.tld",
          scheme: "http",
          port: defaultHttpdPort,
        },
        projectPageIndex: 0,
      },
    });
  });

  test("project with trailing slash", () => {
    expectPathToRoute(
      "/nodes/example.node.tld/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT/",
      {
        resource: "project.source",
        node: {
          hostname: "example.node.tld",
          scheme: "http",
          port: defaultHttpdPort,
        },
        project: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        route: "",
      },
    );
  });

  test("project without trailing slash", () => {
    expectPathToRoute(
      "/nodes/example.node.tld/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      {
        resource: "project.source",
        node: {
          hostname: "example.node.tld",
          scheme: "http",
          port: defaultHttpdPort,
        },
        project: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
        route: "",
      },
    );
  });

  test("non-existent project route", () => {
    expectPathToRoute(
      "/nodes/example.node.tld/rad:zKtT7DmF9H34KkvcKj9PHW19WzjT/nope",
      null,
    );
  });

  function expectPathToRoute(relativeUrl: string, route: Route | null) {
    expect(
      testExports.urlToRoute(new URL(relativeUrl, "http://localhost/")),
    ).toEqual(route);
  }
});
