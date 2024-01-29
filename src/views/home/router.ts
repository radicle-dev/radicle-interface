import type { BaseUrl } from "@httpd-client";
import type { ProjectWithListingData } from "@app/lib/projects";

import { get } from "svelte/store";

import type { LoadErrorRoute } from "@app/lib/router/definitions";
import { getProjectsListingData } from "@app/lib/projects";
import * as seeds from "@app/lib/seeds";
import { api, httpdStore } from "@app/lib/httpd";
import { HttpdClient } from "@httpd-client";

export interface HomeRoute {
  resource: "home";
}

export interface HomeLoadedRoute {
  resource: "home";
  params: {
    nodeId: string | undefined;
    localProjects: ProjectWithListingData[] | "error";
    preferredSeedProjects: ProjectWithListingData[] | "error";
    preferredSeed: BaseUrl;
  };
}

const fetchProjects = async (baseUrl: BaseUrl, show: "all" | "pinned") => {
  const api = new HttpdClient(baseUrl);

  return (await api.project.getAll({ perPage: 30, show })).map(project => ({
    project,
    baseUrl,
  }));
};

function handleProjectLoadError(error: unknown): "error" {
  console.error(error);
  return "error";
}

export async function loadHomeRoute(): Promise<
  HomeLoadedRoute | LoadErrorRoute
> {
  seeds.initialize();
  const preferredSeeds = await seeds.waitForLoad();

  const connectedToLocalNode = get(httpdStore).state !== "stopped";

  const [localProjects, seedProjects] = await Promise.all([
    connectedToLocalNode
      ? fetchProjects(api.baseUrl, "all").catch(handleProjectLoadError)
      : undefined,
    fetchProjects(preferredSeeds.selected, "pinned").catch(
      handleProjectLoadError,
    ),
  ]);

  const projectsWithListingData = await Promise.all([
    localProjects !== "error"
      ? await getProjectsListingData(localProjects ?? [])
      : ("error" as const),
    seedProjects !== "error"
      ? await getProjectsListingData(seedProjects)
      : ("error" as const),
  ]);

  const nodeId = connectedToLocalNode ? (await api.getNode()).id : undefined;

  return {
    resource: "home",
    params: {
      localProjects: projectsWithListingData[0],
      preferredSeedProjects: projectsWithListingData[1],
      preferredSeed: preferredSeeds.selected,
      nodeId,
    },
  };
}
