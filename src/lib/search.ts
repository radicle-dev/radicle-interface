import type { Host } from "@app/lib/api";
import type { ProjectInfo } from "@app/lib/project";

import * as utils from "@app/lib/utils";
import { Project } from "@app/lib/project";
import { config } from "@app/lib/config";

export interface ProjectResult {
  info: ProjectInfo;
  seed: Host;
}

type SearchResult =
  | { type: "nothing" }
  | { type: "error"; message: string }
  | { type: "projects"; projects: ProjectResult[] };

export async function searchProjectsAndProfiles(
  query: string,
): Promise<SearchResult> {
  try {
    const projectOnSeeds = config.seeds.pinned.map(seed => ({
      nid: query,
      seed: {
        host: seed.host,
        port: config.seeds.defaultHttpdPort,
        scheme: config.seeds.defaultHttpdScheme,
      },
    }));

    // The query is a radicle project ID.
    if (utils.isRepositoryId(query)) {
      const projects = await Project.getMulti(projectOnSeeds);

      if (projects.length === 0) {
        return { type: "nothing" };
      } else {
        return {
          type: "projects",
          projects,
        };
      }
    }

    let projects: ProjectResult[] = [];
    try {
      projects = await Project.getMulti(projectOnSeeds);
    } catch {
      // TODO: collect errors and forward to user.
    }

    if (projects.length > 0) {
      return {
        type: "projects",
        projects,
      };
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
