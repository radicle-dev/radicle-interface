import type { BaseUrl, CommitHeader, Project } from "@httpd-client";
import type {
  LoadErrorRoute,
  NotFoundRoute,
} from "@app/lib/router/definitions";
import type { WeeklyActivity } from "@app/lib/commit";

import { HttpdClient } from "@httpd-client";
import { loadProjectActivity } from "@app/lib/commit";
import { config } from "@app/lib/config";

export interface NodesRouteParams {
  baseUrl: BaseUrl;
  projectPageIndex: number;
}

export interface ProjectActivity {
  project: Project;
  latestCommitHeader: CommitHeader;
  activity: WeeklyActivity[];
}

export interface NodesRoute {
  resource: "nodes";
  params: NodesRouteParams;
}

export interface NodesLoadedRoute {
  resource: "nodes";
  params: {
    baseUrl: BaseUrl;
    projectPageIndex: number;
    version: string;
    externalAddresses: string[];
    nid: string;
    projects: ProjectActivity[];
    projectCount: number;
  };
}

const PROJECTS_PER_PAGE = 10;

export async function loadProjects(
  page: number,
  baseUrl: BaseUrl,
): Promise<{
  total: number;
  projects: ProjectActivity[];
}> {
  const api = new HttpdClient(baseUrl);

  const [nodeStats, projects] = await Promise.all([
    api.getStats(),
    api.project.getAll({ page, perPage: PROJECTS_PER_PAGE }),
  ]);

  const results = await Promise.all(
    projects.map(async project => {
      const activity = await loadProjectActivity(project.id, baseUrl);
      const { commit: latestCommitHeader } = await api.project.getCommitBySha(
        project.id,
        project.head,
      );
      return {
        project,
        latestCommitHeader,
        activity,
      };
    }),
  );

  // Sorts projects by most recent commit descending.
  const sortedProjects = results.sort(
    (a, b) =>
      b.latestCommitHeader.committer.time - a.latestCommitHeader.committer.time,
  );

  return {
    total: nodeStats.projects.count,
    projects: sortedProjects,
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
): Promise<NodesLoadedRoute | NotFoundRoute | LoadErrorRoute> {
  const api = new HttpdClient(params.baseUrl);
  try {
    const projectPageIndex = 0;
    const [nodeInfo, node, { projects, total }] = await Promise.all([
      api.getNodeInfo(),
      api.getNode(),
      loadProjects(projectPageIndex, params.baseUrl),
    ]);
    return {
      resource: "nodes",
      params: {
        projectPageIndex: projectPageIndex + 1,
        baseUrl: params.baseUrl,
        nid: nodeInfo.node.id,
        externalAddresses: node.config?.externalAddresses ?? [],
        version: nodeInfo.version,
        projects: projects,
        projectCount: total,
      },
    };
  } catch (error: any) {
    if (error.message === "Failed to fetch") {
      return {
        resource: "notFound",
        params: {
          title: "Node not found",
        },
      };
    } else {
      return {
        resource: "loadError",
        params: {
          title: "Not able to load this node",
          errorMessage: error.message,
          stackTrace: error.stackTrace,
        },
      };
    }
  }
}
