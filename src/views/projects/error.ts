import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";
import type { ProjectRoute } from "@app/views/projects/router";

import { baseUrlToString, isLocal } from "@app/lib/utils";
import { ResponseParseError, ResponseError } from "@http-client/lib/fetcher";
import { httpdStore } from "@app/lib/httpd";
import { get } from "svelte/store";

export function handleError(
  error: Error | ResponseParseError | ResponseError,
  route: ProjectRoute,
): NotFoundRoute | ErrorRoute {
  const url = baseUrlToString(route.node);
  if (error instanceof ResponseError && error.status === 404) {
    let subject;

    if (route.resource === "project.commit") {
      subject = "Commit";
    } else if (route.resource === "project.issue") {
      subject = "Issue";
    } else if (route.resource === "project.patch") {
      subject = "Patch";
    } else {
      subject = "Project";
    }

    return {
      resource: "notFound",
      params: { title: `${subject} not found` },
    };
  } else if (error instanceof ResponseError) {
    return {
      resource: "error",
      params: {
        error,
        title: "Could not load this project",
        description: `Make sure you are able to connect to the seed <a href="${url}">${url}</a>.`,
      },
    };
  } else if (error instanceof ResponseParseError) {
    return {
      resource: "error",
      params: {
        error,
        title: "Could not parse the request",
        description: error.description,
      },
    };
  } else if (
    error instanceof TypeError &&
    error.message === "Failed to fetch" &&
    isLocal(route.node.hostname) &&
    get(httpdStore).state === "stopped"
  ) {
    return {
      resource: "error",
      params: {
        title: "Could not load this project",
        description:
          "You're trying to access a project on your local node but the app is not connected to it. Click the Connect button in the top right corner to connect.",
        error: undefined,
      },
    };
  } else {
    return {
      resource: "error",
      params: {
        error,
        title: "Could not load this project",
        description:
          "You stumbled on an unknown error, we aren't exactly sure what happened.",
      },
    };
  }
}

export function unreachableError(): NotFoundRoute | ErrorRoute {
  return {
    resource: "error",
    params: {
      error: undefined,
      title: "Could not load this route",
      description:
        "You stumbled on an unknown error, we aren't exactly sure what happened.",
    },
  };
}
