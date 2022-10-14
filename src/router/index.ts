// References
//
// https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event

import type { Route } from "./definitions";
import type { Writable } from "svelte/store";

import { get, writable } from "svelte/store";
import { getSearchParam } from "@app/utils";

const BOOT_ROUTE: Route = { type: "home" };

// This is only respected by Safari.
const documentTitle = "Radicle Interface";

export const historyStore = writable<Route[]>([BOOT_ROUTE]);
export const activeRouteStore: Writable<Route> = writable(BOOT_ROUTE);

// Returns the current route params to be spread onto new navigate calls
export function getCurrentRouteParams(type: string): any {
  const activeRoute = get(activeRouteStore);
  if (type === activeRoute.type && "params" in activeRoute) {
    return activeRoute.params;
  }
  return { path: "/" };
}

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

  if (opts?.replace) {
    setHistory([route]);
  } else {
    push(route);
  }
}

function setHistory(history: Route[]): void {
  if (history.length === 0) {
    throw Error("Cannot set empty history");
  }

  historyStore.set(history);
  activeRouteStore.set(history.slice(-1)[0]);
  window.history.replaceState(
    history,
    documentTitle,
    routeToPath(history[history.length - 1]),
  );
}

export const initialize = (): void => {
  const route = pathToRoute(window.location.pathname);
  setHistory([route]);
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
      const view = segments.shift();
      if (nameOrDomain) {
        if (view) {
          const owner = getSearchParam("owner");
          return {
            type: "registrations",
            params: { view, nameOrDomain, owner },
          };
        }
        return {
          type: "registrations",
          params: { nameOrDomain, owner: null, view: null },
        };
      }
      return {
        type: "register",
      };
    }
    case "faucet": {
      const view = segments.shift();
      if (view === "withdraw") {
        return {
          type: "faucet",
          params: { type: "withdraw", amount: getSearchParam("amount") || "0" },
        };
      }
      return { type: "faucet", params: { type: "form" } };
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
            content = segments.shift();
          }
          return {
            type: "projects",
            params: {
              urn,
              seedHost: host,
              content: content || "tree",
              peer: peer || null,
              restRoute: segments.join("/"),
              profileName: null,
              issue: null,
              patch: null,
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
          let content = segments.shift() || "tree";
          let peer;
          if (content === "remotes") {
            peer = segments.shift();
            content = segments.shift() || "tree";
          }
          if (
            ![
              "tree",
              "issue",
              "issues",
              "patch",
              "patches",
              "history",
              "commits",
            ].includes(content)
          ) {
            return { type: "404", params: { path } };
          }
          return {
            type: "projects",
            params: {
              profileName: type,
              urn,
              peer: peer || null,
              seedHost: null,
              restRoute: segments.join("/"),
              issue: null,
              patch: null,
              content,
            },
          };
        }
        return { type: "profile", params: { profileName: type } };
      }
      return { type: "home" };
    }
  }
}

export function routeToPath(route: Route): string | null {
  if (route.type === "home") {
    return "/";
  } else if (route.type === "faucet" && route.params.type === "form") {
    return "/faucet";
  } else if (route.type === "vesting") {
    return "/vesting";
  } else if (route.type === "seeds") {
    return `/seeds/${route.params.host}`;
  } else if (route.type === "faucet" && route.params.type === "withdraw") {
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
  } else if (route.type === "register") {
    return `/registrations`;
  } else if (
    route.type === "registrations" &&
    route.params.nameOrDomain &&
    !route.params.view
  ) {
    return `/registrations/${route.params.nameOrDomain}`;
  } else if (route.type === "registrations" && route.params.view) {
    if (route.params.owner) {
      return `/registrations/${route.params.nameOrDomain}/${route.params.view}?owner=${route.params.owner}`;
    }
    return `/registrations/${route.params.nameOrDomain}/${route.params.view}`;
  } else if (route.type === "profile") {
    return `/${route.params.profileName}`;
  } else if (route.type === "404") {
    return route.params.path;
  }
  return null;
}
