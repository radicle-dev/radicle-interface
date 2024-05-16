import type { BaseUrl, NodeStats, Policy, Scope } from "@httpd-client";
import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";

import { HttpdClient } from "@httpd-client";
import config from "virtual:config";
import { baseUrlToString } from "@app/lib/utils";
import { handleError } from "@app/views/nodes/error";

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
    const [node, stats] = await Promise.all([api.getNode(), api.getStats()]);

    return {
      resource: "nodes",
      params: {
        baseUrl: params.baseUrl,
        nid: node.id,
        stats,
        externalAddresses: node.config?.externalAddresses ?? [],
        version: node.version,
        policy: node.config?.policy,
        scope: node.config?.scope,
      },
    };
  } catch (error: any) {
    return handleError(error, baseUrlToString(api.baseUrl));
  }
}
