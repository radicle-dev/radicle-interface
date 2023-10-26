import type { BaseUrl, Project } from "@httpd-client";

import { HttpdClient } from "@httpd-client";
import { isFulfilled } from "@app/lib/utils";

export interface ProjectBaseUrl {
  project: Project;
  baseUrl: BaseUrl;
}

export async function getProjectsFromNodes(
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
