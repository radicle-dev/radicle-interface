import type { BaseUrl, Project } from "@httpd-client";

import { HttpdClient } from "@httpd-client";
import { isFulfilled } from "@app/lib/utils";
import { cached } from "./cache";
import {
  fetchLastCommit,
  loadProjectActivity,
  type WeeklyActivity,
} from "./commit";

export interface ProjectBaseUrl {
  project: Project;
  baseUrl: BaseUrl;
}

export interface ProjectWithListingData extends ProjectBaseUrl {
  activity: WeeklyActivity[];
  lastCommit: Awaited<ReturnType<typeof fetchLastCommit>>;
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

export async function getProjectListingData(id: string, baseUrl: BaseUrl) {
  const activity = await loadProjectActivity(id, baseUrl);
  const lastCommit = await fetchLastCommit(id, baseUrl);

  return { activity, lastCommit };
}

export async function getProjectsListingData(projects: ProjectBaseUrl[]) {
  const result = await Promise.all(
    projects.map(async ({ project, baseUrl }) => {
      const { activity, lastCommit } = await getProjectListingData(
        project.id,
        baseUrl,
      );
      return { project, activity, lastCommit, baseUrl };
    }),
  );

  return result.sort((a, b) => {
    const aLastCommit = a.lastCommit?.commit.committer.time ?? 0;
    const bLastCommit = b.lastCommit?.commit.committer.time ?? 0;

    return bLastCommit - aLastCommit;
  });
}

export const cacheQueryProject = cached(
  queryProject,
  (baseUrl: BaseUrl, projectId: string) =>
    JSON.stringify({ baseUrl, projectId }),
  { max: 200, ttl: 60 * 60 * 1000 },
);

async function queryProject(
  baseUrl: BaseUrl,
  projectId: string,
): Promise<"found" | "notFound"> {
  const httpd = new HttpdClient(baseUrl);
  return await httpd.project
    .getById(projectId)
    .then<"found">(() => "found")
    .catch(() => "notFound");
}
