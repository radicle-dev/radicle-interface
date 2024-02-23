import type { BaseUrl, Policy, Scope } from "@httpd-client";
import type { ErrorRoute, NotFoundRoute } from "@app/lib/router/definitions";
import type { ProjectWithListingData } from "@app/lib/projects";

import { HttpdClient } from "@httpd-client";
import { config } from "@app/lib/config";
import { baseUrlToString, isLocal } from "@app/lib/utils";
import { getProjectsListingData } from "@app/lib/projects";
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
    projects: ProjectWithListingData[];
    policy?: Policy;
    scope?: Scope;
  };
}

async function loadProjects(
  baseUrl: BaseUrl,
): Promise<ProjectWithListingData[]> {
  const api = new HttpdClient(baseUrl);
  const projects = await api.project.getAll({
    show: isLocal(baseUrl.hostname) ? "all" : "pinned",
  });
  const results = await getProjectsListingData(
    projects.map(p => ({ project: p, baseUrl })),
  );

  return results;
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
    const [node, projects] = await Promise.all([
      api.getNode(),
      loadProjects(params.baseUrl),
    ]);
    return {
      resource: "nodes",
      params: {
        baseUrl: params.baseUrl,
        nid: node.id,
        externalAddresses: node.config?.externalAddresses ?? [],
        version: node.version,
        projects: projects,
        policy: node.config?.policy,
        scope: node.config?.scope,
      },
    };
  } catch (error: any) {
    return handleError(error, baseUrlToString(api.baseUrl));
  }
}
