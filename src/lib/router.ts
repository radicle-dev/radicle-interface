import type { BaseUrl } from "@httpd-client";
import type { LoadedRoute, Route } from "@app/lib/router/definitions";

import { writable } from "svelte/store";

import * as mutexExecutor from "@app/lib/mutexExecutor";
import * as utils from "@app/lib/utils";
import { config } from "@app/lib/config";
import {
  projectRouteToPath,
  projectTitle,
  resolveProjectRoute,
} from "@app/views/projects/router";
import { loadRoute } from "@app/lib/router/definitions";
import { seedPath } from "@app/views/seeds/router";

export { type Route };

export const isLoading = writable<boolean>(true);
export const activeRouteStore = writable<LoadedRoute>({
  resource: "booting",
});

let currentUrl: URL | undefined;

export function useDefaultNavigation(event: MouseEvent) {
  return (
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}

export const base = import.meta.env.VITE_HASH_ROUTING ? "./" : "/";

export async function loadFromLocation(): Promise<void> {
  await navigateToUrl("replace", new URL(window.location.href));
}

export async function navigateToUrl(
  action: "push" | "replace",
  url: URL,
): Promise<void> {
  let { pathname, hash } = url;

  if (url.origin !== window.origin) {
    throw new Error("Cannot navigate to other origin");
  }

  if (import.meta.env.VITE_HASH_ROUTING) {
    if (pathname === "/" && hash && !hash.startsWith("#/")) {
      // We land here if the user clicked an link with only a hash reference.
      // Instead of going to the root page we stop routing here and have the
      // browser take care of things.
      return;
    }
    [pathname, hash] = hash.substring(1).split("#");
  } else {
    if (
      currentUrl &&
      currentUrl.pathname === pathname &&
      currentUrl.search === url.search
    ) {
      return;
    }
  }

  const relativeUrl = pathname + url.search + (hash || "");
  url = new URL(relativeUrl, window.origin);
  const route = urlToRoute(url);

  if (route) {
    await navigate(action, route);
  } else {
    await navigate(action, {
      resource: "notFound",
      params: { url: relativeUrl },
    });
  }
}

window.addEventListener("popstate", () => loadFromLocation());

const loadExecutor = mutexExecutor.create();

async function navigate(
  action: "push" | "replace",
  newRoute: Route,
): Promise<void> {
  isLoading.set(true);
  const path = import.meta.env.VITE_HASH_ROUTING
    ? "#" + routeToPath(newRoute)
    : routeToPath(newRoute);

  if (action === "push") {
    window.history.pushState(newRoute, "", path);
  } else if (action === "replace") {
    window.history.replaceState(newRoute, "");
  }
  currentUrl = new URL(window.location.href);

  const loadedRoute = await loadExecutor.run(async () => {
    return loadRoute(newRoute);
  });

  // Only let the last request through.
  if (loadedRoute === undefined) {
    return;
  }

  setTitle(loadedRoute);
  activeRouteStore.set(loadedRoute);
  isLoading.set(false);
}

function setTitle(loadedRoute: LoadedRoute) {
  const title: string[] = [];

  if (loadedRoute.resource === "booting" || loadedRoute.resource === "home") {
    title.push("Radicle");
  } else if (loadedRoute.resource === "loadError") {
    title.push("Load error");
    title.push("Radicle");
  } else if (loadedRoute.resource === "notFound") {
    title.push("Page not found");
    title.push("Radicle");
  } else if (loadedRoute.resource === "projects") {
    title.push(...projectTitle(loadedRoute));
  } else if (loadedRoute.resource === "seeds") {
    title.push(loadedRoute.params.baseUrl.hostname);
  } else if (loadedRoute.resource === "session") {
    title.push("Authenticating");
    title.push("Radicle");
  } else {
    utils.unreachable(loadedRoute);
  }

  document.title = title.join(" · ");
}

export async function push(newRoute: Route): Promise<void> {
  await navigate("push", newRoute);
}

export async function replace(newRoute: Route): Promise<void> {
  await navigate("replace", newRoute);
}

function extractBaseUrl(hostAndPort: string): BaseUrl {
  if (
    hostAndPort === "radicle.local" ||
    hostAndPort === `radicle.local:${config.seeds.defaultHttpdPort}` ||
    hostAndPort === "0.0.0.0" ||
    hostAndPort === `0.0.0.0:${config.seeds.defaultHttpdPort}` ||
    hostAndPort === "127.0.0.1" ||
    hostAndPort === `127.0.0.1:${config.seeds.defaultHttpdPort}`
  ) {
    return {
      hostname: "127.0.0.1",
      port: config.seeds.defaultHttpdPort,
      scheme: "http",
    };
  } else if (hostAndPort.includes(":")) {
    const [hostname, port] = hostAndPort.split(":");
    return {
      hostname,
      port: Number(port),
      scheme: utils.isLocal(hostname)
        ? "http"
        : config.seeds.defaultHttpdScheme,
    };
  } else {
    return {
      hostname: hostAndPort,
      port: config.seeds.defaultHttpdPort,
      scheme: config.seeds.defaultHttpdScheme,
    };
  }
}

function urlToRoute(url: URL): Route | null {
  const segments = url.pathname.substring(1).split("/");

  const resource = segments.shift();
  switch (resource) {
    case "seeds": {
      const hostAndPort = segments.shift();
      if (hostAndPort) {
        const baseUrl = extractBaseUrl(hostAndPort);
        const id = segments.shift();
        if (id) {
          return resolveProjectRoute(baseUrl, id, segments, url.search);
        } else {
          return {
            resource: "seeds",
            params: { baseUrl, projectPageIndex: 0 },
          };
        }
      }
      return null;
    }
    case "session": {
      const id = segments.shift();
      if (id) {
        return {
          resource: "session",
          params: {
            id,
            signature: url.searchParams.get("sig") ?? "",
            publicKey: url.searchParams.get("pk") ?? "",
          },
        };
      }
      return { resource: "home" };
    }
    case "": {
      return { resource: "home" };
    }
    default: {
      return null;
    }
  }
}

export function routeToPath(route: Route): string {
  if (route.resource === "home") {
    return "/";
  } else if (route.resource === "session") {
    return `/session?id=${route.params.id}&sig=${route.params.signature}&pk=${route.params.publicKey}`;
  } else if (route.resource === "seeds") {
    return seedPath(route.params.baseUrl);
  } else if (route.resource === "loadError") {
    return "";
  } else if (
    route.resource === "project.tree" ||
    route.resource === "project.history" ||
    route.resource === "project.commit" ||
    route.resource === "project.issues" ||
    route.resource === "project.newIssue" ||
    route.resource === "project.issue" ||
    route.resource === "project.patches" ||
    route.resource === "project.patch"
  ) {
    return projectRouteToPath(route);
  } else if (route.resource === "booting") {
    return "";
  } else if (route.resource === "notFound") {
    return route.params.url;
  } else {
    return utils.unreachable(route);
  }
}

export const testExports = { urlToRoute, routeToPath };
