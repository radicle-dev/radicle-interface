import { ResponseParseError, ResponseError } from "@http-client/lib/fetcher";

export function handleError(
  error: Error | ResponseParseError | ResponseError,
  url: string,
): {
  error: Error | ResponseParseError | ResponseError;
  title: string;
  description: string;
} {
  if (error instanceof ResponseParseError) {
    return {
      error,
      title: "Could not parse the request",
      description: error.description,
    };
  } else if (error instanceof ResponseError) {
    return {
      error,
      title: "Could not load the projects",
      description: `You're trying to fetch projects from a node that is not reachable, make sure the address <a href="${url}">${url}</a> is correct and the right ports are exposed if its your node.`,
    };
  } else if (
    error instanceof TypeError &&
    error.message === "Failed to fetch"
  ) {
    return {
      error,
      title: "Resource not found",
      description: `You're trying to fetch a resource that is not available. Check that the ids is correct, and try to run <code>$ rad sync</code>.`,
    };
  } else {
    return {
      error,
      title: "Could not load this view",
      description:
        "You stumbled on an unknown error, we aren't exactly sure what happened.",
    };
  }
}
