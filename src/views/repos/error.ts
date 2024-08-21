import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";
import type { RepoRoute } from "@app/views/repos/router";

import { baseUrlToString } from "@app/lib/utils";
import { ResponseParseError, ResponseError } from "@http-client/lib/fetcher";

export function handleError(
  error: Error | ResponseParseError | ResponseError,
  route: RepoRoute,
): NotFoundRoute | ErrorRoute {
  const url = baseUrlToString(route.node);
  if (error instanceof ResponseError && error.status === 404) {
    let subject;

    if (route.resource === "repo.commit") {
      subject = "Commit";
    } else if (route.resource === "repo.issue") {
      subject = "Issue";
    } else if (route.resource === "repo.patch") {
      subject = "Patch";
    } else {
      subject = "Repository";
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
        title: "Could not load this repository",
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
  } else {
    return {
      resource: "error",
      params: {
        error,
        title: "Could not load this repository",
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
