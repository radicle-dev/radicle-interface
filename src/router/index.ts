// References
//
// https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event

import type { Writable } from "svelte/store";

import { get, writable } from "svelte/store";

export type Route =
  | { type: "home" }
  | { type: "vesting" }
  | {
      type: "registrations";
    }
  | {
      type: "registrationsActions";
      params: { activeView: string; nameOrDomain: string };
    }
  | {
      type: "registrationsView";
      params: { nameOrDomain: string };
    }
  | { type: "faucet" }
  | { type: "withdraw" }
  | { type: "seeds"; params: { host: string } }
  | { type: "profile"; params: { profile: string } }
  | {
      type: "project";
      params: {
        seed: boolean;
        activeView: string;
        urn: string;
        line?: number;
        path?: string;
        patch?: string;
        issue?: string;
        profile?: string;
        host?: string;
        peer?: string;
        revision?: string;
      };
    };

const BOOT_ROUTE: Route = { type: "home" };

export const historyStore = writable<Route[]>([BOOT_ROUTE]);
export const activeRouteStore: Writable<Route> = writable(BOOT_ROUTE);

export const push = (newRoute: Route): void => {
  window.history.pushState({}, "", routeToPath(newRoute));
  const history = get(historyStore);
  // Limit history to a maximum of 10 steps. We shouldn't be doing more than
  // one subsequent pop() anyway.
  setHistory([...history, newRoute].slice(-10));
};

window.addEventListener("popstate", ({ state }) => {
  setHistory(state);
});

export function navigate(path: string, opts = { replace: false }) {
  if (opts.replace) {
    setHistory([pathToRoute(path)]);
  } else {
    push(pathToRoute(path));
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
    "",
    routeToPath(history[history.length - 1]),
  );
}

// Takes the window.location.pathname which is a the URL without origin
// Strips the first "/" from the pathname
// Sets the historyStore to a Route type
export const initialize = async (): Promise<void> => {
  const segments = window.location.pathname;

  setHistory([pathToRoute(segments)]);
};

export function routeToPath(route: Route): string {
  if (route.type === "home") {
    return "/";
  } else if (route.type === "profile") {
    return `/${route.params.profile}`;
  } else if (route.type === "vesting") {
    return "/vesting";
  } else if (route.type === "seeds") {
    return `/seeds/${route.params.host}`;
  } else if (route.type === "registrations") {
    return `/registrations`;
  } else if (route.type === "registrationsActions") {
    return `/registrations/${route.params.nameOrDomain}/${route.params.activeView}`;
  } else if (route.type === "registrationsView") {
    return `/registrations/${route.params.nameOrDomain}`;
  } else if (route.type === "project") {
    if (route.params.activeView) {
      if (route.params.revision) {
        return `/${route.params.seed && "seeds/"}${route.params.host}/${
          route.params.urn
        }/${route.params.activeView}/${route.params.revision}`;
      }
      return `/${route.params.seed && "seeds/"}${route.params.host}/${
        route.params.urn
      }/${route.params.activeView}`;
    }
    return `/${route.params.seed && "seeds/"}${route.params.host}/${
      route.params.urn
    }`;
  }
  return "/";
}

// When provided a URL in split into segments, we need to convert them to Route objects
export function pathToRoute(path: string): Route {
  const segments = path.substring(1).split("/");
  const type = segments.shift();
  switch (type) {
    case "seeds": {
      const host = segments.shift();
      const urn = segments.shift();
      if (host && !urn) {
        return { type: "seeds", params: { host } };
      } else if (host && urn) {
        const projectType = segments.shift();
        if (projectType === "tree") {
          return {
            type: "project",
            params: {
              seed: true,
              host,
              urn,
              activeView: projectType,
            },
          };
        } else if (projectType === "patches") {
          const patch = segments.shift();
          return {
            type: "project",
            params: {
              seed: true,
              host,
              urn,
              patch,
              activeView: projectType,
            },
          };
        } else if (projectType === "issues") {
          const issue = segments.shift();
          return {
            type: "project",
            params: {
              seed: true,
              host,
              urn,
              issue,
              activeView: projectType,
            },
          };
        }
      }
      return { type: "home" };
    }
    case "vesting":
      return { type: "vesting" };
    case "registrations": {
      const nameOrDomain = segments.shift();
      if (!nameOrDomain) {
        return { type: "registrations" };
      }
      const activeView = segments.shift();
      if (activeView) {
        return {
          type: "registrationsActions",
          params: { activeView, nameOrDomain },
        };
      }
      return { type: "registrationsView", params: { nameOrDomain } };
    }
    default:
      if (type) {
        const urn = segments.shift();
        if (urn) {
          const projectType = segments.shift();
          const revision = segments.shift();
          return {
            type: "project",
            params: {
              seed: false,
              profile: type,
              urn,
              revision,
              activeView: projectType || "tree",
            },
          };
        } else {
          return { type: "profile", params: { profile: type } };
        }
      } else {
        return { type: "home" };
      }
  }
}

export function link(node: HTMLElement) {
  function onClick(event: any) {
    const anchor = event.currentTarget;

    if (anchor.target === "") {
      event.preventDefault();
      console.log(anchor.pathname);
      navigate(anchor.pathname, {
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
