import type { BaseUrl } from "@httpd-client";
import type { LoadedRoute, Route } from "@app/lib/router/definitions";

import { get, writable } from "svelte/store";

import * as mutexExecutor from "@app/lib/mutexExecutor";
import * as utils from "@app/lib/utils";
import { config } from "@app/lib/config";
import {
  createProjectRoute,
  resolveProjectRoute,
} from "@app/views/projects/router";
import { loadRoute } from "@app/lib/router/definitions";

export { type Route };

// Only used by Safari.
const DOCUMENT_TITLE = "Radicle Interface";

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
  let route = pathToRoute(url);

  if (route) {
    const activeRoute = get(activeRouteStore);
    if (
      activeRoute.resource === "projects" &&
      route.resource === "projects" &&
      route.params.hash
    ) {
      if (route.params.hash.match(/^L\d+$/)) {
        route = createProjectRoute(activeRoute, {});
      } else {
        route = createProjectRoute(activeRoute, { hash: route.params.hash });
      }
    }

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
    window.history.pushState(newRoute, DOCUMENT_TITLE, path);
  } else if (action === "replace") {
    window.history.replaceState(newRoute, DOCUMENT_TITLE, path);
  }
  currentUrl = new URL(window.location.href);

  const loadedRoute = await loadExecutor.run(async () => {
    return loadRoute(newRoute);
  });

  // Only let the last request through.
  if (loadedRoute === undefined) {
    return;
  }

  activeRouteStore.set(loadedRoute);
  isLoading.set(false);
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
    hostAndPort === "radicle.local:8080" ||
    hostAndPort === "0.0.0.0" ||
    hostAndPort === "0.0.0.0:8080" ||
    hostAndPort === "127.0.0.1" ||
    hostAndPort === "127.0.0.1:8080"
  ) {
    return { hostname: "127.0.0.1", port: 8080, scheme: "http" };
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

function pathToRoute(url: URL): Route | null {
  const segments = url.pathname.substring(1).split("/");

  const resource = segments.shift();
  switch (resource) {
    case "seeds": {
      const hostAndPort = segments.shift();
      if (hostAndPort) {
        const baseUrl = extractBaseUrl(hostAndPort);
        const id = segments.shift();
        if (id) {
          // Allows project paths with or without trailing slash
          if (
            segments.length === 0 ||
            (segments.length === 1 && segments[0] === "")
          ) {
            return {
              resource: "projects",
              params: {
                view: { resource: "tree" },
                id,
                peer: undefined,
                baseUrl,
              },
            };
          }
          const params = resolveProjectRoute(url, baseUrl, id, segments);
          if (params) {
            return {
              resource: "projects",
              params: {
                ...params,
                baseUrl,
                id,
              },
            };
          }
          return null;
        }
        return {
          resource: "seeds",
          params: { baseUrl, projectPageIndex: 0 },
        };
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

function seedPath(baseUrl: BaseUrl) {
  const port = baseUrl.port ?? config.seeds.defaultHttpdPort;

  if (port === config.seeds.defaultHttpdPort) {
    return `/seeds/${baseUrl.hostname}`;
  } else {
    return `/seeds/${baseUrl.hostname}:${port}`;
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
  } else if (route.resource === "projects") {
    const seed = seedPath(route.params.baseUrl);
    const content = `/${route.params.view.resource}`;

    let peer = "";
    if (route.params.peer) {
      peer = `/remotes/${route.params.peer}`;
    }

    let suffix = "";
    if (route.params.route) {
      suffix = `/${route.params.route}`;
    } else {
      if (
        (route.params.view.resource === "tree" ||
          route.params.view.resource === "history") &&
        route.params.revision
      ) {
        suffix = `/${route.params.revision}`;
      }
      if (route.params.path && route.params.path !== "/") {
        suffix += `/${route.params.path}`;
      }
    }

    if (route.params.hash) {
      suffix += `#${route.params.hash}`;
    }

    if (route.params.view.resource === "tree") {
      if (suffix) {
        return `${seed}/${route.params.id}${peer}/tree${suffix}`;
      }
      return `${seed}/${route.params.id}${peer}`;
    } else if (route.params.view.resource === "commits") {
      return `${seed}/${route.params.id}${peer}/commits/${route.params.view.commitId}`;
    } else if (route.params.view.resource === "history") {
      return `${seed}/${route.params.id}${peer}/history${suffix}`;
    } else if (
      route.params.view.resource === "issues" &&
      route.params.view.params?.view.resource === "new"
    ) {
      return `${seed}/${route.params.id}${peer}/issues/new${suffix}`;
    } else if (route.params.view.resource === "issues") {
      if (route.params.view.params.search) {
        suffix += `?${route.params.view.params.search}`;
      }
      return `${seed}/${route.params.id}${peer}/issues${suffix}`;
    } else if (route.params.view.resource === "issue") {
      return `${seed}/${route.params.id}${peer}/issues/${route.params.view.params.issue}`;
    } else if (route.params.view.resource === "patches") {
      if (route.params.view.params.search) {
        suffix += `?${route.params.view.params.search}`;
      }
      return `${seed}/${route.params.id}${peer}/patches${suffix}`;
    } else if (route.params.view.resource === "patch") {
      if (route.params.view.params.search) {
        suffix += `?${route.params.view.params.search}`;
      }
      if (route.params.view.params.revision) {
        return `${seed}/${route.params.id}${peer}/patches/${route.params.view.params.patch}/${route.params.view.params.revision}${suffix}`;
      }
      return `${seed}/${route.params.id}${peer}/patches/${route.params.view.params.patch}${suffix}`;
    } else {
      return `${seed}/${route.params.id}${peer}${content}`;
    }
  } else if (route.resource === "booting") {
    return "";
  } else if (route.resource === "notFound") {
    return route.params.url;
  } else {
    return utils.unreachable(route);
  }
}

export const testExports = { pathToRoute, routeToPath };
