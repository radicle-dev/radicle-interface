// References
//
// https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event

import { loadRoute, type LoadedRoute, type Route } from "./definitions";
import type { Writable } from "svelte/store";

import { get, writable } from "svelte/store";
import { getSearchParam } from "@app/utils";
import { getConfig } from "@app/config";
import type { ProjectView } from "@app/base/projects/route";

const BOOT_ROUTE: Route & LoadedRoute = { type: "loading" };

// This is only respected by Safari.
const documentTitle = "Radicle Interface";

export const historyStore = writable<Route[]>([BOOT_ROUTE]);
export const activeRouteStore: Writable<LoadedRoute> = writable(BOOT_ROUTE);

export function link(node: any) {
  async function onClick(event: any): Promise<void> {
    const anchor = event.currentTarget;

    if (anchor.target === "") {
      event.preventDefault();
      await navigate(pathToRoute(anchor.pathname), {
        replace: anchor.hasAttribute("replace"),
      });
    }
  }

  node.addEventListener("click", () => onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    },
  };
}

export const push = async (newRoute: Route): Promise<void> => {
  window.history.pushState(newRoute, documentTitle, routeToPath(newRoute));
  const history = get(historyStore);
  // Limit history to a maximum of 10 steps. We shouldn't be doing more than
  // one subsequent pop() anyway.
  await setHistory([...history, newRoute].slice(-10));
};

// Replaces history on any user interaction with forward and backwards buttons
// with the current window.history.state
window.addEventListener("popstate", e => {
  setHistory(e.state);
});

export async function navigate(
  route: Route | string,
  opts?: { retry?: boolean; replace?: boolean },
): Promise<void> {
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
    await setHistory([route]);
  } else {
    await push(route);
  }
}

async function setHistory(history: Route[]): Promise<void> {
  if (history.length === 0) {
    throw Error("Cannot set empty history");
  }
  const currentRoute = history.slice(-2)[0];
  const targetRoute = history.slice(-1)[0];

  // In case of switching between different route types, pass through a loading screen
  if (history.length >= 2 && currentRoute.type !== targetRoute.type) {
    activeRouteStore.set({ type: "loading" });
  }

  const config = await getConfig();
  const loadedRoute = await loadRoute(targetRoute, config);

  historyStore.set(history);
  activeRouteStore.set(loadedRoute);
  window.history.replaceState(history, documentTitle, routeToPath(targetRoute));
}

export const initialize = async () => {
  await setHistory([pathToRoute(window.location.pathname)]);
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
          resolveProjectRoute("seedHost", segments, path, urn, host);
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
          resolveProjectRoute("profileName", segments, path, urn, type);
        }
        return { type: "profile", params: { addressOrName: type } };
      }
      return { type: "home" };
    }
  }
}

export function routeToPath(route: Route): string | null {
  console.log(route);
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

    const content = route.params.activeView.type
      ? `/${route.params.activeView.type}`
      : "";

    let peer = "";
    if (route.params.peer) {
      peer = `/remotes/${route.params.peer}`;
    }

    if (
      route.params.activeView.type === "tree" ||
      route.params.activeView.type === "commits" ||
      route.params.activeView.type === "commit"
    ) {
      const restRoute = route.params.activeView.restRoute
        ? `/${route.params.activeView.restRoute}`
        : "";

      return `${hostPrefix}/${route.params.urn}${peer}${content}${restRoute}`;
    } else if (route.params.activeView.type === "patch") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}/${route.params.activeView.patch}`;
    } else if (route.params.activeView.type === "issue") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}/${route.params.activeView.issue}`;
    } else {
      return `${hostPrefix}/${route.params.urn}${peer}${content}`;
    }
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

function resolveProjectRoute(
  key: "seedHost" | "profileName",
  segments: any,
  path: string,
  urn: string,
  input?: string,
): Route {
  let content = segments.shift();
  let peer;
  let activeView: ProjectView = { type: "tree", restRoute: "" };
  if (content === "remotes") {
    peer = segments.shift();
    content = segments.shift();
  }

  if (content === "tree") {
    const restRoute = segments.shift() || "";
    activeView = { type: "tree", restRoute };
  } else if (content === "commits") {
    const restRoute = segments.shift() || "";
    activeView = { type: "commits", restRoute };
  } else if (content === "commit") {
    const restRoute = segments.shift() || "";
    activeView = { type: "commit", restRoute };
  } else if (content === "patch") {
    const patch = segments.shift();
    if (patch) {
      activeView = { type: "patch", patch };
    }
    return { type: "404", params: { path } };
  } else if (content === "issue") {
    const issue = segments.shift();
    if (issue) {
      activeView = { type: "issue", issue };
    }
    return { type: "404", params: { path } };
  }

  const params = {
    urn,
    peer,
    activeView,
  };
  return {
    type: "projects",
    params: { ...params, [key]: input },
  };
}
