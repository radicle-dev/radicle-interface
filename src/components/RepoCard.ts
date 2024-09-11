import type { BaseUrl, Repo, RepoListQuery } from "@http-client";

import { loadRepoActivity, type WeeklyActivity } from "@app/lib/commit";
import { HttpdClient } from "@http-client";

export interface RepoInfo {
  repo: Repo;
  baseUrl: BaseUrl;
  activity: WeeklyActivity[];
}

export async function fetchRepoInfos(
  baseUrl: BaseUrl,
  query?: RepoListQuery,
  delegate?: string,
): Promise<RepoInfo[]> {
  const api = new HttpdClient(baseUrl);
  let repos: Repo[];

  if (delegate) {
    repos = await api.repo.getByDelegate(delegate, query);
  } else {
    repos = await api.repo.getAll(query);
  }
  const info = await Promise.all(
    repos
      .filter(r => Boolean(r.payloads["xyz.radicle.project"]))
      .map(async repo => {
        const activity = await loadRepoActivity(repo.rid, baseUrl);
        return { repo, activity, baseUrl };
      }),
  );

  return info.sort((a, b) => {
    if (a.activity.length === 0 && b.activity.length === 0) {
      return 0;
    } else if (a.activity.length === 0 && b.activity.length > 0) {
      return 1;
    } else if (b.activity.length === 0 && a.activity.length > 0) {
      return -1;
    } else {
      return b.activity[0].time - a.activity[0].time;
    }
  });
}
