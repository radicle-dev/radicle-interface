import type { Stats } from "@app/project";
import type { Diff } from "@app/diff";
import { ApiError } from "@app/api";

export interface CommitsHistory {
  headers: CommitMetadata[];
  stats: Stats;
}

export interface CommitMetadata {
  header: CommitHeader;
  context: CommitContext;
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

export interface Person {
  name: string;
}

export interface CommitContext {
  committer?: {
    peer: {
      id: string;
      person: Person;
      delegate: boolean;
    };
  };
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
  commits: CommitMetadata[];
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

export function groupCommits(commits: { header: CommitHeader; context: CommitContext }[]): CommitGroup[] {
  const groupedCommits: CommitGroup[] = [];
  let groupDate: Date | undefined = undefined;

  try {
    commits = commits.sort((a, b) => {
      if (a.header.committerTime > b.header.committerTime) {
        return -1;
      } else if (a.header.committerTime < b.header.committerTime) {
        return 1;
      }

      return 0;
    });

    for (const commit of commits) {
      const time = commit.header.committerTime * 1000;
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
  } catch (err) {
    throw new ApiError("Not able to create commit history, please consider updating seed HTTP API.");
  }
}

export const formatCommitTime = (t: number): string => {
  return new Date(t * 1000).toUTCString();
};
