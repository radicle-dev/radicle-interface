// References
//
// https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event

import type * as Registrations from "@app/base/registrations/Routes.svelte";
import type * as Faucet from "@app/base/faucet/Routes.svelte";
import type * as Profile from "@app/Profile.svelte";
import type * as Seeds from "@app/base/seeds/Routes.svelte";
import type * as Projects from "@app/base/projects/Routes.svelte";
import type { Writable } from "svelte/store";

import { get, writable } from "svelte/store";
import { getSearchParam } from "@app/utils";

export type Route =
  | { type: "404"; params: { path: string } }
  | { type: "faucet"; params: Faucet.Params }
  | { type: "home" }
  | { type: "profile"; params: Profile.Params }
  | { type: "projects"; params: Projects.Params }
  | { type: "register" }
  | { type: "registrations"; params: Registrations.Params }
  | { type: "seeds"; params: Seeds.Params }
  | { type: "vesting" };

const BOOT_ROUTE: Route = { type: "home" };

// This is only respected by Safari.
const documentTitle = "Radicle Upstream";

export const historyStore = writable<Route[]>([BOOT_ROUTE]);
export const activeRouteStore: Writable<Route> = writable(BOOT_ROUTE);

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

export function navigate(route: Route | string, opts = { replace: false }) {
  if (typeof route === "string") {
    route = pathToRoute(route);
  }

  if (opts.replace) {
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

export const initialize = async (): Promise<void> => {
  setHistory([pathToRoute(window.location.pathname)]);
};

export function pathToRoute(path: string): Route {
  // Pathname starts usually with a "/", we remove it to avoid mal interpretations
  path = path.startsWith("/") ? path.substring(1) : path;
  const segments = path.split("/");
  const type = segments.shift();
  switch (type) {
    case "registrations": {
      const nameOrDomain = segments.shift();
      const action = segments.shift();
      if (nameOrDomain) {
        if (!action) {
          return {
            type: "registrations",
            params: { view: "view", nameOrDomain, owner: null },
          };
        } else if (action) {
          const owner = getSearchParam("owner");
          return {
            type: "registrations",
            params: { view: action, nameOrDomain, owner },
          };
        }
      }
      return {
        type: "register",
      };
    }
    case "faucet": {
      const view = segments.shift();
      if (view === "withdraw") {
        return { type: "faucet", params: { type: "withdraw" } };
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
          const content = segments.shift();
          let peer;
          if (content === "remotes") {
            peer = segments.shift();
          }
          const revision = segments.shift();
          if (revision) {
            return {
              type: "projects",
              params: {
                profileName: null,
                urn,
                peer: peer || null,
                seedHost: host,
                revision,
                content: content || "tree",
                path: null,
                line: null,
                issue: null,
                patch: null,
              },
            };
          }
          return {
            type: "projects",
            params: {
              profileName: null,
              urn,
              peer: peer || null,
              seedHost: host,
              path: null,
              line: null,
              issue: null,
              patch: null,
              revision: null,
              content: content || "tree",
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
          const content = segments.shift();
          return {
            type: "projects",
            params: {
              profileName: type,
              urn,
              peer: null,
              seedHost: null,
              revision: null,
              content: content || "tree",
              path: null,
              line: null,
              issue: null,
              patch: null,
            },
          };
        }
        return { type: "profile", params: { profileName: type } };
      }
    }
  }
}

export function routeToPath(route: Route): string {
  if (route.type === "home") {
    return `/`;
  } else if (route.type === "faucet" && route.params.type === "form") {
    return `/faucet`;
  } else if (route.type === "vesting") {
    return `/vesting`;
  } else if (route.type === "seeds") {
    return `/seeds/${route.params.host}`;
  } else if (route.type === "faucet" && route.params.type === "withdraw") {
    return `/faucet/withdraw`;
  } else if (route.type === "projects") {
    let hostPrefix;
    if (route.params.seedHost) {
      hostPrefix = `/seeds/${route.params.seedHost}`;
    } else {
      hostPrefix = `/${route.params.profileName}`;
    }

    let path = "";
    if (route.params.path !== null) {
      path = `/${route.params.path}`;
    }

    if (route.params.peer) {
      return `${hostPrefix}/${route.params.urn}/remotes/${route.params.peer}/${route.params.content}/${route.params.revision}${path}`;
    }

    return `${hostPrefix}/${route.params.urn}/${route.params.content}/${route.params.revision}${path}`;
  } else if (route.type === "register") {
    return `/registrations`;
  } else if (route.type === "registrations" && route.params.nameOrDomain) {
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
}
