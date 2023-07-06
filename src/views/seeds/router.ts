import type { BaseUrl, Project } from "@httpd-client";
import type { LoadError } from "@app/lib/router/definitions";
import type { WeeklyActivity } from "@app/lib/commit";

import { HttpdClient } from "@httpd-client";
import { loadProjectActivity } from "@app/lib/commit";
import { config } from "@app/lib/config";

interface SeedsRouteParams {
  baseUrl: BaseUrl;
  projectPageIndex: number;
}

export interface ProjectActivity {
  project: Project;
  activity: WeeklyActivity[];
}

export interface SeedsRoute {
  resource: "seeds";
  params: SeedsRouteParams;
}

export interface SeedsLoadedRoute {
  resource: "seeds";
  params: {
    baseUrl: BaseUrl;
    projectPageIndex: number;
    version: string;
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
      return {
        project,
        activity,
      };
    }),
  );

  return {
    total: nodeStats.projects.count,
    projects: results,
  };
}

export function seedPath(baseUrl: BaseUrl) {
  const port = baseUrl.port ?? config.seeds.defaultHttpdPort;

  if (port === config.seeds.defaultHttpdPort) {
    return `/seeds/${baseUrl.hostname}`;
  } else {
    return `/seeds/${baseUrl.hostname}:${port}`;
  }
}

export async function loadSeedRoute(
  params: SeedsRouteParams,
): Promise<SeedsLoadedRoute | LoadError> {
  const api = new HttpdClient(params.baseUrl);
  try {
    const projectPageIndex = 0;
    const [nodeInfo, { projects, total }] = await Promise.all([
      api.getNodeInfo(),
      loadProjects(projectPageIndex, params.baseUrl),
    ]);
    return {
      resource: "seeds",
      params: {
        projectPageIndex: projectPageIndex + 1,
        baseUrl: params.baseUrl,
        nid: nodeInfo.node.id,
        version: nodeInfo.version,
        projects: projects,
        projectCount: total,
      },
    };
  } catch (error: any) {
    return {
      resource: "loadError",
      params: {
        title: `${params.baseUrl.hostname}:${params.baseUrl.port}`,
        errorMessage: "Not able to query this seed.",
        stackTrace: error.stack,
      },
    };
  }
}
