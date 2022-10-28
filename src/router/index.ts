import type { ProjectsParams, Route } from "./definitions";
import type { Writable } from "svelte/store";

import { get, writable } from "svelte/store";

const BOOT_ROUTE: Route = { type: "boot" };

// This is only respected by Safari.
const documentTitle = "Radicle Interface";

export const historyStore = writable<Route[]>([BOOT_ROUTE]);
export const activeRouteStore: Writable<Route> = writable(BOOT_ROUTE);

export function link(node: any, route?: Route) {
  function onClick(event: any): void {
    const anchor = event.currentTarget;
    let path: string | Route;

    // Checking if we passed a route param into use:link
    if (!route) {
      const url = new URL(anchor.href);
      path = url.pathname + url.search + url.hash;
    } else {
      path = route;
    }

    if (anchor.target === "") {
      event.preventDefault();
      navigate(path, {
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

// Replaces history on any user interaction with forward and backwards buttons
// with the current window.history.state
window.addEventListener("popstate", e => {
  if (e.state) replace(e.state);
});

export function navigate(
  route: Route | string,
  opts?: { replace?: boolean },
): void {
  if (typeof route === "string") {
    route = pathToRoute(route);
  }

  // If we don't explicitly pass a anchor tag hash or query string, we should reset it globally
  if (route.type === "projects" && !route.params.hash) {
    route.params = { ...route.params, hash: null, search: null };
  }

  // If activeRoute and newRoute are type === "projects" combine the route params
  const activeRoute = get(activeRouteStore);
  if (route.type === "projects" && activeRoute.type === "projects") {
    route.params = { ...activeRoute.params, ...route.params };
  }

  if (opts?.replace) {
    replace(route);
  } else {
    push(route);
  }
}

export const push = (newRoute: Route): void => {
  const history = get(historyStore);

  // Limit history to a maximum of 10 steps. We shouldn't be doing more than
  // one subsequent pop() anyway.
  historyStore.set([...history, newRoute].slice(-10));
  activeRouteStore.set(newRoute);
  window.history.pushState(newRoute, documentTitle, routeToPath(newRoute));
};

export const pop = (): void => {
  const history = get(historyStore);
  const newRoute = history.pop();
  if (newRoute) {
    historyStore.set(history);
    activeRouteStore.set(newRoute);
    window.history.back();
  }
};

export function replace(newRoute: Route): void {
  historyStore.set([newRoute]);
  activeRouteStore.set(newRoute);
  window.history.replaceState(newRoute, documentTitle, routeToPath(newRoute));
}

export const initialize = () => {
  const { pathname, search, hash } = window.location;
  replace(pathToRoute(pathname + search + hash));
};

export function pathToRoute(path: string | null): Route {
  if (!path) {
    return { type: "404" };
  }

  const url = new URL(path, "https://app.radicle.xyz");
  // Pathname starts usually with a "/", we remove it to avoid bad interpretations
  const segments = url.pathname.substring(1).split("/");

  const type = segments.shift();
  switch (type) {
    case "registration": {
      const nameOrDomain = segments.shift();
      const activeView = segments.shift();
      const owner = url.searchParams.get("owner");
      const retry = url.searchParams.get("retry");

      if (nameOrDomain) {
        if (
          activeView === "checkNameAvailability" ||
          activeView === "register"
        ) {
          return {
            type: "registration",
            params: {
              activeView: {
                type: activeView,
                params: { nameOrDomain, owner },
              },
            },
          };
        } else if (activeView === undefined) {
          return {
            type: "registration",
            params: {
              activeView: {
                type: "view",
                params: { nameOrDomain, retry: retry === "true" },
              },
            },
          };
        }
      }
      return {
        type: "registration",
        params: { activeView: { type: "validateName" } },
      };
    }
    case "faucet": {
      const view = segments.shift();
      if (view === "withdraw") {
        return {
          type: "faucet",
          params: {
            activeView: {
              type: "withdraw",
              params: { amount: url.searchParams.get("amount") },
            },
          },
        };
      }
      return { type: "faucet", params: { activeView: { type: "form" } } };
    }
    case "vesting":
      return { type: "vesting" };
    case "seeds": {
      const host = segments.shift();
      if (host) {
        const urn = segments.shift();
        if (urn) {
          if (segments.length === 0) {
            return {
              type: "projects",
              params: {
                activeView: { type: "tree" },
                urn,
                peer: null,
                profile: null,
                seed: host,
                content: "tree",
              },
            };
          }
          const params = resolveProjectRoute(url, urn, segments);
          if (params) {
            return {
              type: "projects",
              params: {
                ...params,
                search: url.search,
                seed: host,
                urn,
              },
            };
          }
          return { type: "404" };
        }
        return { type: "seeds", params: { host } };
      }
      return { type: "404" };
    }
    case "":
      return { type: "home" };
    default: {
      if (type) {
        const urn = segments.shift();
        if (urn) {
          if (segments.length === 0) {
            return {
              type: "projects",
              params: {
                activeView: { type: "tree" },
                urn,
                peer: null,
                profile: type,
                seed: null,
                content: "tree",
              },
            };
          } else {
            const params = resolveProjectRoute(url, urn, segments);
            if (params) {
              return {
                type: "projects",
                params: {
                  ...params,
                  urn,
                  search: url.search,
                  profile: type,
                },
              };
            }
          }
          return { type: "404" };
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
  } else if (
    route.type === "faucet" &&
    route.params.activeView.type === "form"
  ) {
    return "/faucet";
  } else if (
    route.type === "faucet" &&
    route.params.activeView.type === "withdraw"
  ) {
    return `/faucet/withdraw?amount=${route.params.activeView.params.amount}`;
  } else if (route.type === "vesting") {
    return "/vesting";
  } else if (route.type === "seeds") {
    return `/seeds/${route.params.host}`;
  } else if (route.type === "projects") {
    let hostPrefix;
    if (route.params.profile) {
      hostPrefix = `/${route.params.profile}`;
    } else {
      hostPrefix = `/seeds/${route.params.seed}`;
    }

    const content = route.params.content ? `/${route.params.content}` : "";

    let peer = "";
    if (route.params.peer) {
      peer = `/remotes/${route.params.peer}`;
    }

    let suffix = "";
    if (!route.params.route) {
      if (route.params.revision) {
        suffix = `/${route.params.revision}`;
      }
      if (route.params.path && route.params.path !== "/") {
        suffix += `/${route.params.path}`;
      }
      if (route.params.hash) {
        suffix += `#${route.params.hash}`;
      }
      if (route.params.search) {
        suffix += `${route.params.search}`;
      }
    } else {
      suffix = `/${route.params.route}`;
      if (route.params.search) {
        suffix += `${route.params.search}`;
      }
      if (route.params.hash) {
        suffix += `#${route.params.hash}`;
      }
    }

    if (route.params.content === "tree") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}${suffix}`;
    } else if (route.params.content === "commits") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}${suffix}`;
    } else if (route.params.content === "commit") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}${suffix}`;
    } else if (route.params.content === "patches") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}${suffix}`;
    } else if (route.params.activeView.type === "patch") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}/${route.params.activeView.params.patch}`;
    } else if (route.params.activeView.type === "issue") {
      return `${hostPrefix}/${route.params.urn}${peer}${content}/${route.params.activeView.params.issue}`;
    } else {
      return `${hostPrefix}/${route.params.urn}${peer}${content}`;
    }
  } else if (
    route.type === "registration" &&
    route.params.activeView.type === "validateName"
  ) {
    return `/registration`;
  } else if (
    route.type === "registration" &&
    route.params.activeView.type === "view"
  ) {
    return `/registration/${route.params.activeView.params.nameOrDomain}?retry=${route.params.activeView.params.retry}`;
  } else if (
    route.type === "registration" &&
    (route.params.activeView.type === "checkNameAvailability" ||
      route.params.activeView.type === "register")
  ) {
    if (route.params.activeView.params.owner) {
      return `/registration/${route.params.activeView.params.nameOrDomain}/${route.params.activeView.type}?owner=${route.params.activeView.params.owner}`;
    }
    return `/registration/${route.params.activeView.params.nameOrDomain}/${route.params.activeView.type}`;
  } else if (route.type === "profile") {
    return `/${route.params.addressOrName}`;
  } else if (route.type === "404") {
    return null;
  }
  return null;
}

function resolveProjectRoute(
  url: URL,
  urn: string,
  segments: string[],
): ProjectsParams | null {
  let content = segments.shift();
  let peer = null;
  if (content === "remotes") {
    peer = segments.shift() || null;
    content = segments.shift();
  }

  if (content === "tree") {
    return {
      activeView: { type: "tree" },
      urn,
      peer,
      content: "tree",
      path: null,
      revision: null,
      hash: url.hash.substring(1),
      route: segments.join("/"),
    };
  } else if (content === "commits") {
    return {
      activeView: { type: "commits" },
      urn,
      peer,
      content: "commits",
      path: null,
      revision: null,
      route: segments.join("/"),
    };
  } else if (content === "commit") {
    return {
      activeView: { type: "commit" },
      urn,
      peer,
      content: "commit",
      path: null,
      revision: null,
      route: segments.join("/"),
    };
  } else if (content === "patch") {
    const patch = segments.shift();
    if (patch) {
      return {
        activeView: { type: "patch", params: { patch } },
        urn,
        peer,
        content: "patch",
        path: null,
        revision: null,
      };
    }
    return null;
  } else if (content === "patches") {
    return {
      activeView: { type: "patches" },
      urn,
      peer,
      content: "patches",
      path: null,
      revision: null,
    };
  } else if (content === "issues") {
    return {
      activeView: { type: "issues" },
      urn,
      peer,
      content: "issues",
      path: null,
      revision: null,
    };
  } else if (content === "issue") {
    const issue = segments.shift();
    if (issue) {
      return {
        activeView: { type: "issue", params: { issue } },
        urn,
        peer,
        content: "issue",
        path: null,
        revision: null,
      };
    }
    return null;
  }

  return null;
}
