import type { Stats, Person } from "@app/project";
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
  date: string;
  time: number;
  commits: CommitMetadata[];
  week: number;
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
          date: formatGroupTime(time),
          time,
          commits: [],
          week: 0
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

export function groupCommitsByWeek(commits: CommitMetadata[]): CommitGroup[] {
  const groupedCommits: CommitGroup[] = [];
  let groupDate: Date | undefined = undefined;

  if (commits.length === 0) {
    return [];
  }

  commits = commits.sort((a, b) => {
    if (a.header.committerTime > b.header.committerTime) {
      return -1;
    } else if (a.header.committerTime < b.header.committerTime) {
      return 1;
    }

    return 0;
  });

  // A accumulator that increments by the amount of weeks between weekly commit groups
  let weekAccumulator = Math.floor(getDaysPassed(new Date(commits[0].header.committerTime * 1000), new Date()) / 7);

  // Loops over all commits and stores them by week with some additional metadata in groupedCommits.
  for (const commit of commits) {
    const time = commit.header.committerTime * 1000;
    const date = new Date(time);
    const isNewWeek =
      !groupedCommits.length ||
      !groupDate ||
      getDaysPassed(date, groupDate) > 7 ||
      date.getFullYear() < groupDate.getFullYear();

    if (isNewWeek) {
      let daysPassed = 0;
      if (groupDate) {
        daysPassed = getDaysPassed(date, groupDate);
      }
      groupedCommits.push({
        date: formatGroupTime(time),
        time,
        commits: [],
        week: Math.floor(daysPassed / 7) + weekAccumulator
      });
      groupDate = date;
      weekAccumulator += Math.floor(daysPassed / 7);
    }
    groupedCommits[groupedCommits.length - 1].commits.push(commit);
  }

  return groupedCommits;
}

// Get amount of days passed between two dates
function getDaysPassed(from: Date, to: Date): number {
  return Math.floor(
    (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)
  );
}
