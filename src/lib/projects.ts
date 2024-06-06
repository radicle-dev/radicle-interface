import type { BaseUrl, Project } from "@http-client";

import { HttpdClient } from "@http-client";
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

export async function queryProject(
  baseUrl: BaseUrl,
  projectId: string,
): Promise<"found" | "notFound"> {
  const httpd = new HttpdClient(baseUrl);
  return await httpd.project
    .getById(projectId)
    .then<"found">(() => "found")
    .catch(() => "notFound");
}
