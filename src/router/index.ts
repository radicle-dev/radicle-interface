// References
//
// https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event

import { loadRoute, type LoadedRoute, type Route } from "./definitions";
import type { Writable } from "svelte/store";

import { get, writable } from "svelte/store";
import { getSearchParam } from "@app/utils";
import { getConfig } from "@app/config";
import type { Content } from "@app/base/projects/route";

const BOOT_ROUTE: Route & LoadedRoute = { type: "loading" };

// This is only respected by Safari.
const documentTitle = "Radicle Interface";

export const historyStore = writable<Route[]>([BOOT_ROUTE]);
export const activeRouteStore: Writable<LoadedRoute> = writable(BOOT_ROUTE);

activeRouteStore.subscribe(console.log);

export function link(node: any) {
  function onClick(event: any) {
    const anchor = event.currentTarget;

    if (anchor.target === "") {
      event.preventDefault();
      navigate(pathToRoute(anchor.pathname), {
        replace: anchor.hasAttribute("replace"),
      });
    }
  }

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    },
  };
}

export const push = (newRoute: Route): void => {
  window.history.pushState(newRoute, documentTitle, routeToPath(newRoute));
  const history = get(historyStore);
  // Limit history to a maximum of 10 steps. We shouldn't be doing more than
  // one subsequent pop() anyway.
  setHistory([...history, newRoute].slice(-10));
};

// Replaces history on any user interaction with forward and backwards buttons
// with the current window.history.state
window.addEventListener("popstate", e => {
  setHistory(e.state);
});

export function navigate(
  route: Route | string,
  opts?: { retry?: boolean; replace?: boolean },
) {
  if (typeof route === "string") {
    route = pathToRoute(route);
  }

  // If current and new route have route params, and spreads old and new ones.
  const currentRoute = get(historyStore).slice(-1)[0];
  if ("params" in currentRoute && "params" in route) {
    const newRouteParams = route.params;
    const currentRouteParams = currentRoute.params;
    route.params = { ...currentRouteParams, ...newRouteParams };
  }

  if (opts?.replace) {
    setHistory([route]);
  } else {
    push(route);
  }
}

async function setHistory(history: Route[]): Promise<void> {
  if (history.length === 0) {
    throw Error("Cannot set empty history");
  }

  // In case of switching between different route types, pass through a loading screen
  if (
    history.length >= 2 &&
    history.slice(-2)[0].type !== history.slice(-1)[0].type
  ) {
    activeRouteStore.set({ type: "loading" });
  }

  const config = await getConfig();
  const loadedRoute = await loadRoute(history.slice(-1)[0], config);

  historyStore.set(history);
  activeRouteStore.set(loadedRoute);
  window.history.replaceState(
    history,
    documentTitle,
    routeToPath(history[history.length - 1]),
  );
}

export const initializeRouter = (): void => {
  setHistory([pathToRoute(window.location.pathname)]);
};

export function pathToRoute(path: string | null): Route {
  if (!path) {
    return { type: "404", params: { path: "/" } };
  }
  // Pathname starts usually with a "/", we remove it to avoid mal interpretations
  path = path.startsWith("/") ? path.substring(1) : path;
  const segments = path.split("/");
  const type = segments.shift();
  switch (type) {
    case "registrations": {
      const nameOrDomain = segments.shift();
      const activeView = segments.shift();
      if (nameOrDomain) {
        if (activeView) {
          const owner = getSearchParam("owner");
          return {
            type: "registrations",
            params: { activeView, nameOrDomain, owner },
          };
        }
        return {
          type: "registrations",
          params: { nameOrDomain, owner: null, activeView: null },
        };
      }
      return {
        type: "registrations",
        params: { nameOrDomain: null, owner: null, activeView: null },
      };
    }
    case "faucet": {
      const view = segments.shift();
      if (view === "withdraw") {
        return {
          type: "faucet",
          params: {
            activeView: "withdraw",
            amount: getSearchParam("amount"),
          },
        };
      }
      return { type: "faucet", params: { activeView: "form", amount: null } };
    }
    case "vesting":
      return { type: "vesting" };
    case "seeds": {
      const host = segments.shift();
      if (host) {
        const urn = segments.shift();
        if (urn) {
          let content = segments.shift();
          let peer;
          if (content === "remotes") {
            peer = segments.shift();
            content = segments.shift() || "tree";
          } else if (!content) {
            content = "tree";
          }
          return {
            type: "projects",
            params: {
              urn,
              seedHost: host,
              content: content as Content,
              peer,
              restRoute: segments.join("/"),
            },
          };
        }
        return { type: "seeds", params: { host } };
      }
      return { type: "404", params: { path } };
    }
    case "":
      return { type: "home" };
    default: {
      if (type) {
        const urn = segments.shift();
        if (urn) {
          let content = segments.shift();
          let peer;
          if (content === "remotes") {
            peer = segments.shift();
            content = segments.shift() || "tree";
          } else if (!content) {
            content = "tree";
          }
          if (
            !["tree", "issues", "patches", "history", "commits"].includes(
              content,
            )
          ) {
            return { type: "404", params: { path } };
          }
          return {
            type: "projects",
            params: {
              profileName: type,
              urn,
              peer,
              restRoute: segments.join("/"),
              content: content as Content,
            },
          };
        }
        return { type: "profile", params: { addressOrName: type } };
      }
      return { type: "home" };
    }
  }
}

export function routeToPath(route: Route): string | null {
  if (route.type === "home") {
    return "/";
  } else if (route.type === "faucet" && route.params.activeView === "form") {
    return "/faucet";
  } else if (route.type === "vesting") {
    return "/vesting";
  } else if (route.type === "seeds") {
    return `/seeds/${route.params.host}`;
  } else if (
    route.type === "faucet" &&
    route.params.activeView === "withdraw"
  ) {
    return "/faucet/withdraw";
  } else if (route.type === "projects") {
    let hostPrefix;
    if (route.params.seedHost) {
      hostPrefix = `/seeds/${route.params.seedHost}`;
    } else {
      hostPrefix = `/${route.params.profileName}`;
    }

    const content = route.params.content ? `/${route.params.content}` : "";

    const restRoute = route.params.restRoute
      ? `/${route.params.restRoute}`
      : "";

    if (route.params.peer) {
      return `${hostPrefix}/${route.params.urn}/remotes/${route.params.peer}${content}${restRoute}`;
    }

    return `${hostPrefix}/${route.params.urn}${content}${restRoute}`;
  } else if (
    route.type === "registrations" &&
    !route.params.nameOrDomain &&
    !route.params.activeView
  ) {
    return `/registrations`;
  } else if (
    route.type === "registrations" &&
    route.params.nameOrDomain &&
    !route.params.activeView
  ) {
    return `/registrations/${route.params.nameOrDomain}`;
  } else if (route.type === "registrations" && route.params.activeView) {
    if (route.params.owner) {
      return `/registrations/${route.params.nameOrDomain}/${route.params.activeView}?owner=${route.params.owner}`;
    }
    return `/registrations/${route.params.nameOrDomain}/${route.params.activeView}`;
  } else if (route.type === "profile") {
    return `/${route.params.addressOrName}`;
  } else if (route.type === "404") {
    return route.params.path;
  }
  return null;
}
