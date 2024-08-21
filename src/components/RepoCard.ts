import type { Repo, RepoListQuery } from "@http-client";

import { loadRepoActivity, type WeeklyActivity } from "@app/lib/commit";
import { HttpdClient, type BaseUrl, type Commit } from "@http-client";

export interface RepoInfo {
  repo: Repo;
  baseUrl: BaseUrl;
  activity: WeeklyActivity[];
  lastCommit: Commit;
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
    repos.map(async repo => {
      const [activity, lastCommit] = await Promise.all([
        loadRepoActivity(repo.rid, baseUrl),
        api.repo.getCommitBySha(repo.rid, repo.head),
      ]);
      return { repo, activity, lastCommit, baseUrl };
    }),
  );

  return info.sort((a, b) => {
    const aLastCommit = a.lastCommit.commit.committer.time;
    const bLastCommit = b.lastCommit.commit.committer.time;

    return bLastCommit - aLastCommit;
  });
}
