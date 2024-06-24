import type { BaseUrl, NodeStats, Policy, Scope } from "@http-client";
import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";

import config from "virtual:config";
import { HttpdClient } from "@http-client";
import { ResponseError, ResponseParseError } from "@http-client/lib/fetcher";
import { baseUrlToString } from "@app/lib/utils";
import { handleError } from "@app/views/nodes/error";
import { unreachableError } from "@app/views/projects/error";

export interface NodesRouteParams {
  baseUrl: BaseUrl;
  projectPageIndex: number;
}

export interface NodesRoute {
  resource: "nodes";
  params: NodesRouteParams;
}

export interface NodesLoadedRoute {
  resource: "nodes";
  params: {
    baseUrl: BaseUrl;
    version: string;
    externalAddresses: string[];
    nid: string;
    stats: NodeStats;
    policy?: Policy;
    scope?: Scope;
    imageUrl?: string;
    title?: string;
    description?: string;
  };
}

export function nodePath(baseUrl: BaseUrl) {
  const port = baseUrl.port ?? config.nodes.defaultHttpdPort;

  if (port === config.nodes.defaultHttpdPort) {
    return `/nodes/${baseUrl.hostname}`;
  } else {
    return `/nodes/${baseUrl.hostname}:${port}`;
  }
}

export async function loadNodeRoute(
  params: NodesRouteParams,
): Promise<NodesLoadedRoute | NotFoundRoute | ErrorRoute> {
  const api = new HttpdClient(params.baseUrl);
  try {
    const [node, stats, profile] = await Promise.all([
      api.getNode(),
      api.getStats(),
      api.profile.getProfile(),
    ]);

    return {
      resource: "nodes",
      params: {
        baseUrl: params.baseUrl,
        nid: node.id,
        stats,
        externalAddresses: node.config?.externalAddresses ?? [],
        version: node.version,
        policy: node.config?.seedingPolicy.default,
        scope: node.config?.seedingPolicy.scope,
        imageUrl: profile.config?.web.imageUrl,
        title: profile.config?.web.title,
        description: profile.config?.web.description,
      },
    };
  } catch (error) {
    if (
      error instanceof Error ||
      error instanceof ResponseError ||
      error instanceof ResponseParseError
    ) {
      return handleError(error, baseUrlToString(api.baseUrl));
    } else {
      return unreachableError();
    }
  }
}
