import type { ProjectsParams, Route, ProjectRoute } from "./definitions";
import type { Readable } from "svelte/store";

import { get, writable, derived } from "svelte/store";
import { unreachable } from "@app/utils";

// This is only respected by Safari.
const documentTitle = "Radicle Interface";

export const historyStore = writable<Route[]>([{ resource: "home" }]);

export const activeRouteStore: Readable<Route> = derived(
  historyStore,
  store => {
    return store.slice(-1)[0];
  },
);

export const base = process.env.hashRouting ? "./" : "/";

// Gets triggered when clicking on an anchor hash tag e.g. <a href="#header"/>
// Allows the jump to a anchor hash
window.addEventListener("hashchange", e => {
  const url = new URL(e.newURL);
  updateProjectRoute({ hash: url.hash.substring(1) });
});

// Replaces history on any user interaction with forward and backwards buttons
// with the current window.history.state
window.addEventListener("popstate", e => {
  if (e.state) replace(e.state);
});

export function createProjectRoute(
  activeRoute: ProjectRoute,
  projectRouteParams: Partial<ProjectsParams>,
): ProjectRoute {
  return {
    resource: "projects",
    params: {
      ...activeRoute.params,
      line: undefined,
      hash: undefined,
      ...projectRouteParams,
    },
  };
}

export function projectLinkHref(
  projectRouteParams: Partial<ProjectsParams>,
): string | undefined {
  const activeRoute = get(activeRouteStore);

  if (activeRoute.resource === "projects") {
    return routeToPath(createProjectRoute(activeRoute, projectRouteParams));
  } else {
    throw new Error(
      "Don't use project specific navigation outside of project views",
    );
  }
}

export function updateProjectRoute(
  projectRouteParams: Partial<ProjectsParams>,
) {
  const activeRoute = get(activeRouteStore);

  if (activeRoute.resource === "projects") {
    const updatedRoute = createProjectRoute(activeRoute, projectRouteParams);
    push(updatedRoute);
  } else {
    throw new Error(
      "Don't use project specific navigation outside of project views",
    );
  }
}

export const push = (newRoute: Route): void => {
  const history = get(historyStore);

  // Limit history to a maximum of 10 steps. We shouldn't be doing more than
  // one subsequent pop() anyway.
  historyStore.set([...history, newRoute].slice(-10));

  const path = process.env.hashRouting
    ? "#" + routeToPath(newRoute)
    : routeToPath(newRoute);

  window.history.pushState(newRoute, documentTitle, path);
};

export const pop = (): void => {
  const history = get(historyStore);
  const newRoute = history.pop();
  if (newRoute) {
    historyStore.set(history);
    window.history.back();
  }
};

export function replace(newRoute: Route): void {
  historyStore.set([newRoute]);

  const path = process.env.hashRouting
    ? "#" + routeToPath(newRoute)
    : routeToPath(newRoute);

  window.history.replaceState(newRoute, documentTitle, path);
}

export const initialize = () => {
  const { pathname, search, hash } = window.location;
  const url = pathname + search + hash;
  const route = pathToRoute(url);

  if (route) {
    replace(route);
  } else {
    replace({ resource: "404", params: { url } });
  }
};

function pathToRoute(path: string): Route | null {
  // This matches e.g. an empty string
  if (!path) {
    return null;
  }

  const url = new URL(path, window.origin);
  const segments = process.env.hashRouting
    ? url.hash.substring(2).split("#")[0].split("/") // Try to remove any additional hashes at the end of the URL.
    : url.pathname.substring(1).split("/");

  const resource = segments.shift();
  switch (resource) {
    case "registrations": {
      const nameOrDomain = segments.shift();
      const view = segments.shift();
      const owner = url.searchParams.get("owner");
      const retry = url.searchParams.get("retry");

      if (nameOrDomain) {
        if (view === "checkNameAvailability" || view === "register") {
          return {
            resource: "registrations",
            params: {
              view: {
                resource: view,
                params: { nameOrDomain, owner },
              },
            },
          };
        } else if (!view) {
          return {
            resource: "registrations",
            params: {
              view: {
                resource: "view",
                params: { nameOrDomain, retry: retry === "true" },
              },
            },
          };
        }
      }
      return {
        resource: "registrations",
        params: { view: { resource: "validateName" } },
      };
    }
    case "faucet": {
      const view = segments.shift();
      if (view === "withdraw") {
        return {
          resource: "faucet",
          params: {
            view: {
              resource: "withdraw",
              params: { amount: url.searchParams.get("amount") },
            },
          },
        };
      }
      return { resource: "faucet", params: { view: { resource: "form" } } };
    }
    case "vesting":
      return { resource: "vesting" };
    case "seeds": {
      const host = segments.shift();
      if (host) {
        const urn = segments.shift();
        if (urn) {
          if (segments.length === 0) {
            return {
              resource: "projects",
              params: {
                view: { resource: "tree" },
                urn,
                peer: undefined,
                profile: undefined,
                seed: host,
              },
            };
          }
          const params = resolveProjectRoute(url, urn, segments);
          if (params) {
            return {
              resource: "projects",
              params: {
                ...params,
                search: url.search,
                seed: host,
                urn,
              },
            };
          }
          return null;
        }
        return { resource: "seeds", params: { host } };
      }
      return null;
    }
    case "":
      return { resource: "home" };
    default: {
      if (resource) {
        const urn = segments.shift();
        if (urn) {
          if (segments.length === 0) {
            return {
              resource: "projects",
              params: {
                view: { resource: "tree" },
                urn,
                peer: undefined,
                profile: resource,
                seed: undefined,
              },
            };
          } else {
            const params = resolveProjectRoute(url, urn, segments);
            if (params) {
              return {
                resource: "projects",
                params: {
                  ...params,
                  urn,
                  search: url.search,
                  profile: resource,
                },
              };
            }
          }
          return null;
        }
        return { resource: "profile", params: { addressOrName: resource } };
      }
      return { resource: "home" };
    }
  }
}

export function routeToPath(route: Route) {
  if (route.resource === "home") {
    return "/";
  } else if (route.resource === "faucet") {
    if (route.params.view.resource === "form") {
      return "/faucet";
    } else if (route.params.view.resource === "withdraw") {
      return `/faucet/withdraw?amount=${route.params.view.params.amount}`;
    }
  } else if (route.resource === "vesting") {
    return "/vesting";
  } else if (route.resource === "seeds") {
    return `/seeds/${route.params.host}`;
  } else if (route.resource === "projects") {
    let hostPrefix;
    if (route.params.profile) {
      hostPrefix = `/${route.params.profile}`;
    } else {
      hostPrefix = `/seeds/${route.params.seed}`;
    }

    const content = `/${route.params.view.resource}`;

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
      if (route.params.line) {
        suffix += `#${route.params.line}`;
      } else if (route.params.hash) {
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
      if (route.params.line) {
        suffix += `#${route.params.line}`;
      } else if (route.params.hash) {
        suffix += `#${route.params.hash}`;
      }
    }

    if (route.params.view.resource === "tree") {
      return `${hostPrefix}/${route.params.urn}${peer}/tree${suffix}`;
    } else if (route.params.view.resource === "commits") {
      return `${hostPrefix}/${route.params.urn}${peer}/commits${suffix}`;
    } else if (route.params.view.resource === "history") {
      return `${hostPrefix}/${route.params.urn}${peer}/history${suffix}`;
    } else if (route.params.view.resource === "patches") {
      return `${hostPrefix}/${route.params.urn}${peer}/patches${suffix}`;
    } else if (route.params.view.resource === "patch") {
      return `${hostPrefix}/${route.params.urn}${peer}/patches/${route.params.view.params.patch}`;
    } else if (route.params.view.resource === "issues") {
      return `${hostPrefix}/${route.params.urn}${peer}/issues${suffix}`;
    } else if (route.params.view.resource === "issue") {
      return `${hostPrefix}/${route.params.urn}${peer}/issues/${route.params.view.params.issue}`;
    } else {
      return `${hostPrefix}/${route.params.urn}${peer}${content}`;
    }
  } else if (route.resource === "registrations") {
    if (route.params.view.resource === "validateName") {
      return `/registrations`;
    } else if (route.params.view.resource === "view") {
      return `/registrations/${route.params.view.params.nameOrDomain}?retry=${route.params.view.params.retry}`;
    } else if (
      route.params.view.resource === "checkNameAvailability" ||
      route.params.view.resource === "register"
    ) {
      if (route.params.view.params.owner) {
        return `/registrations/${route.params.view.params.nameOrDomain}/${route.params.view.resource}?owner=${route.params.view.params.owner}`;
      }
      return `/registrations/${route.params.view.params.nameOrDomain}/${route.params.view.resource}`;
    }
  } else if (route.resource === "profile") {
    return `/${route.params.addressOrName}`;
  } else if (route.resource === "404") {
    return route.params.url;
  } else {
    unreachable(route);
  }
}

function resolveProjectRoute(
  url: URL,
  urn: string,
  segments: string[],
): ProjectsParams | null {
  let content = segments.shift();
  let peer;
  if (content === "remotes") {
    peer = segments.shift();
    content = segments.shift();
  }

  if (content === "tree") {
    const line = url.href.match(/#L\d+$/)?.pop();
    const hash = url.href.match(/#{1}[^#.]+$/)?.pop();
    return {
      view: { resource: "tree" },
      urn,
      peer,
      path: undefined,
      revision: undefined,
      line: line?.substring(1),
      hash: hash?.substring(1),
      route: segments.join("/"),
    };
  } else if (content === "history") {
    return {
      view: { resource: "history" },
      urn,
      peer,
      path: undefined,
      revision: undefined,
      route: segments.join("/"),
    };
  } else if (content === "commits") {
    return {
      view: { resource: "commits" },
      urn,
      peer,
      path: undefined,
      revision: undefined,
      route: segments.join("/"),
    };
  } else if (content === "patches") {
    const patch = segments.shift();
    if (patch) {
      return {
        view: { resource: "patch", params: { patch } },
        urn,
        peer,
        path: undefined,
        revision: undefined,
      };
    } else {
      return {
        view: { resource: "patches" },
        urn,
        peer,
        path: undefined,
        revision: undefined,
      };
    }
  } else if (content === "issues") {
    const issue = segments.shift();
    if (issue) {
      return {
        view: { resource: "issue", params: { issue } },
        urn,
        peer,
        path: undefined,
        revision: undefined,
      };
    } else {
      return {
        view: { resource: "issues" },
        urn,
        peer,
        path: undefined,
        revision: undefined,
      };
    }
  }

  return null;
}

export const testExports = { pathToRoute };
