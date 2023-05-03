import type { BaseUrl, Project } from "@httpd-client";

import * as utils from "@app/lib/utils";
import { HttpdClient } from "@httpd-client";
import { config } from "@app/lib/config";
import { isFulfilled } from "@app/lib/utils";

export interface ProjectBaseUrl {
  project: Project;
  baseUrl: BaseUrl;
}

type SearchResult =
  | { type: "nothing" }
  | { type: "error"; message: string }
  | { type: "projects"; results: ProjectBaseUrl[] };

export async function searchProjectsAndProfiles(
  query: string,
): Promise<SearchResult> {
  try {
    const pinned = config.seeds.pinned.map(seed => ({
      id: query,
      baseUrl: seed.baseUrl,
    }));

    if (utils.isRepositoryId(query)) {
      const results = await getProjectsFromSeeds(pinned);

      if (results.length === 0) {
        return { type: "nothing" };
      } else {
        return {
          type: "projects",
          results,
        };
      }
    }

    return { type: "nothing" };
  } catch (error) {
    let message = "An unknown error occoured while searching.";

    if (error instanceof Error) {
      message = error.message;
    }

    return { type: "error", message };
  }
}

export async function getProjectsFromSeeds(
  params: { id: string; baseUrl: BaseUrl }[],
): Promise<ProjectBaseUrl[]> {
  const projectPromises = params.map(async param => {
    const api = new HttpdClient(param.baseUrl);
    const project = await api.project.getById(param.id);
    return {
      project,
      baseUrl: param.baseUrl,
    };
  });

  const results = await Promise.allSettled(projectPromises);
  return results.filter(isFulfilled).map(r => r.value);
}
