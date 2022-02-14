import type { Stats } from "@app/base/projects/Project";
import type { Diff } from "@app/diff";

export interface CommitsHistory {
  headers: CommitHeader[];
  stats: Stats;
}
export interface GroupedCommitsHistory {
  headers: CommitGroup[];
  stats: Stats;
}

export interface Author {
  avatar: string;
  email: string;
  name: string;
}

export interface CommitStats {
  branches: number;
  commits: number;
  contributors: number;
}

export interface GroupedCommitsHistory {
  headers: CommitGroup[];
  stats: Stats;
}

export interface CommitHeader {
  author: Author;
  committer: Author;
  committerTime: number;
  description: string;
  sha1: string;
  summary: string;
}

// A set of commits grouped by time.
export interface CommitGroup {
  time: string;
  commits: CommitHeader[];
}

export interface CommitStats {
  additions: number;
  deletions: number;
}

export interface Commit {
  header: CommitHeader;
  stats: CommitStats;
  diff: Diff;
  branches: string[];
}

export function formatGroupTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: 'numeric',
    weekday: 'long',
    month: 'long',
    year: 'numeric'
  });
}

export const groupCommitHistory = (
  history: CommitsHistory
): GroupedCommitsHistory => {
  return { ...history, headers: groupCommits(history.headers) };
};

export function groupCommits(commits: CommitHeader[]): CommitGroup[] {
  const groupedCommits: CommitGroup[] = [];
  let groupDate: Date | undefined = undefined;

  commits = commits.sort((a, b) => {
    if (a.committerTime > b.committerTime) {
      return -1;
    } else if (a.committerTime < b.committerTime) {
      return 1;
    }

    return 0;
  });

  for (const commit of commits) {
    const time = commit.committerTime * 1000;
    const date = new Date(time);
    const isNewDay =
      !groupedCommits.length ||
      !groupDate ||
      date.getDate() < groupDate.getDate() ||
      date.getMonth() < groupDate.getMonth() ||
      date.getFullYear() < groupDate.getFullYear();

    if (isNewDay) {
      groupedCommits.push({
        time: formatGroupTime(time),
        commits: [],
      });
      groupDate = date;
    }
    groupedCommits[groupedCommits.length - 1].commits.push(commit);
  }
  return groupedCommits;
}

export const formatCommitTime = (t: number): string => {
  return new Date(t * 1000).toUTCString();
};
