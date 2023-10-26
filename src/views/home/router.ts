import type { LoadErrorRoute } from "@app/lib/router/definitions";
import type { ProjectBaseUrl } from "@app/lib/projects";
import type { WeeklyActivity } from "@app/lib/commit";

import { get } from "svelte/store";

import { api, httpdStore } from "@app/lib/httpd";
import { config } from "@app/lib/config";
import { getProjectsFromNodes } from "@app/lib/projects";
import { loadProjectActivity } from "@app/lib/commit";

export interface ProjectBaseUrlActivity extends ProjectBaseUrl {
  activity: WeeklyActivity[];
}

export interface HomeRoute {
  resource: "home";
}

export interface HomeLoadedRoute {
  resource: "home";
  params: { projects: ProjectBaseUrlActivity[] };
}

export async function loadHomeRoute(): Promise<
  HomeLoadedRoute | LoadErrorRoute
> {
  let projects: ProjectBaseUrl[] = [];
  if (get(httpdStore).state !== "stopped") {
    projects = (await api.project.getAll()).map(project => ({
      project,
      baseUrl: api.baseUrl,
    }));
  } else {
    projects = await getProjectsFromNodes(config.projects.pinned);
  }
  const results = await Promise.all(
    projects.map(async projectNode => {
      const activity = await loadProjectActivity(
        projectNode.project.id,
        projectNode.baseUrl,
      );
      return {
        ...projectNode,
        activity,
      };
    }),
  );

  return { resource: "home", params: { projects: results } };
}
