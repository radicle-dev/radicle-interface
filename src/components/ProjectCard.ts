import type { ProjectListQuery } from "@http-client";

import { loadProjectActivity, type WeeklyActivity } from "@app/lib/commit";
import {
  HttpdClient,
  type BaseUrl,
  type Commit,
  type Project,
} from "@http-client";

export interface ProjectInfo {
  project: Project;
  baseUrl: BaseUrl;
  activity: WeeklyActivity[];
  lastCommit: Commit;
}

export async function fetchProjectInfos(
  baseUrl: BaseUrl,
  query?: ProjectListQuery,
): Promise<ProjectInfo[]> {
  const api = new HttpdClient(baseUrl);
  const projects = await api.project.getAll(query);
  const info = await Promise.all(
    projects.map(async project => {
      const [activity, lastCommit] = await Promise.all([
        loadProjectActivity(project.id, baseUrl),
        api.project.getCommitBySha(project.id, project.head),
      ]);
      return { project, activity, lastCommit, baseUrl };
    }),
  );

  return info.sort((a, b) => {
    const aLastCommit = a.lastCommit.commit.committer.time;
    const bLastCommit = b.lastCommit.commit.committer.time;

    return bLastCommit - aLastCommit;
  });
}
