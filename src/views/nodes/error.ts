import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";
import { ResponseParseError, ResponseError } from "@httpd-client/lib/fetcher";

export function handleError(
  error: Error | ResponseParseError | ResponseError,
  url: string,
): NotFoundRoute | ErrorRoute {
  if (error instanceof ResponseParseError) {
    return {
      resource: "error",
      params: {
        error,
        title: "Could not parse the request",
        description:
          "The response received from the seed does not match the expected schema, this is usually due to a version mismatch between the seed and the web interface.",
      },
    };
  } else if (error instanceof ResponseError) {
    return {
      resource: "error",
      params: {
        error,
        title: "Could not load this node",
        description: `You're trying to access a node that is not reachable, make sure the address <a href="${url}">${url}</a> is correct and the right ports are exposed if its your node.`,
      },
    };
  } else if (
    error instanceof TypeError &&
    error.message === "Failed to fetch"
  ) {
    return {
      resource: "notFound",
      params: { title: "Node not found" },
    };
  } else {
    return {
      resource: "error",
      params: {
        error,
        title: "Could not load this node",
        description:
          "You stumbled on an unknown error, we aren't exactly sure what happened.",
      },
    };
  }
}
