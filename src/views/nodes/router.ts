import type { BaseUrl, Policy, Scope } from "@httpd-client";
import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";

import { HttpdClient } from "@httpd-client";
import { config } from "@app/lib/config";
import { baseUrlToString, isLocal } from "@app/lib/utils";
import { handleError } from "@app/views/nodes/error";
import {
  fetchProjectInfos,
  type ProjectInfo,
} from "@app/components/ProjectCard";

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
    projectInfos: ProjectInfo[];
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
    const [node, projectInfos] = await Promise.all([
      api.getNode(),
      fetchProjectInfos(
        params.baseUrl,
        isLocal(params.baseUrl.hostname) ? "all" : "pinned",
      ),
    ]);
    return {
      resource: "nodes",
      params: {
        baseUrl: params.baseUrl,
        nid: node.id,
        externalAddresses: node.config?.externalAddresses ?? [],
        version: node.version,
        projectInfos: projectInfos,
        policy: node.config?.policy,
        scope: node.config?.scope,
      },
    };
  } catch (error: any) {
    return handleError(error, baseUrlToString(api.baseUrl));
  }
}
