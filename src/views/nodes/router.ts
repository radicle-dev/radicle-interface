import type { BaseUrl, DefaultSeedingPolicy, NodeStats } from "@http-client";
import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";

import config from "virtual:config";
import { HttpdClient } from "@http-client";
import { ResponseError, ResponseParseError } from "@http-client/lib/fetcher";
import { baseUrlToString, isLocal } from "@app/lib/utils";
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
    agent: string;
    externalAddresses: string[];
    nid: string;
    stats: NodeStats;
    seedingPolicy?: DefaultSeedingPolicy;
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
  if (
    import.meta.env.PROD &&
    isLocal(`${params.baseUrl.hostname}:${params.baseUrl.port}`)
  ) {
    return {
      resource: "error",
      params: {
        icon: "device",
        title: "Local node browsing not supported",
        description: `You're trying to access a local node from your browser, we are currently working on a desktop app specific for this use case. Join our <strong>#desktop</strong> channel on <radicle-external-link href="${config.supportWebsite}">${config.supportWebsite}</radicle-external-link> for more information.`,
      },
    };
  }
  const api = new HttpdClient(params.baseUrl);
  try {
    const [node, stats] = await Promise.all([api.getNode(), api.getStats()]);

    return {
      resource: "nodes",
      params: {
        baseUrl: params.baseUrl,
        nid: node.id,
        stats,
        externalAddresses: node.config?.externalAddresses ?? [],
        seedingPolicy: node.config?.seedingPolicy,
        agent: node.agent,
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
