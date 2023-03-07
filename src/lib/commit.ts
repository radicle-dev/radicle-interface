import type { Stats } from "@app/lib/project";
import type { Diff, DiffStats } from "@app/lib/diff";
import { ApiError } from "@app/lib/api";
import { getDaysPassed } from "@app/lib/utils";

export interface CommitsHistory {
  commits: CommitMetadata[];
  stats: Stats;
}

export interface CommitMetadata {
  commit: CommitHeader;
}

export interface Author {
  email: string;
  name: string;
  time: number;
}

export interface CommitStats {
  branches: number;
  commits: number;
  contributors: number;
}

export interface GroupedCommitsHistory {
  commits: CommitGroup[];
  stats: Stats;
}

export interface CommitHeader {
  author: Author;
  committer: Author;
  description: string;
  id: string;
  summary: string;
}

// A set of commits grouped by time.
export interface CommitGroup {
  date: string;
  time: number;
  commits: CommitMetadata[];
  week: number;
}

export interface WeeklyActivity {
  date: string;
  time: number;
  commits: number[];
  week: number;
}

export interface Commit {
  commit: CommitHeader;
  stats: DiffStats;
  diff: Diff;
  branches: string[];
}

export function formatGroupTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: "numeric",
    weekday: "long",
    month: "long",
    year: "numeric",
  });
}

export function groupCommits(
  commits: { commit: CommitHeader }[],
): CommitGroup[] {
  const groupedCommits: CommitGroup[] = [];
  let groupDate: Date | undefined = undefined;

  try {
    commits = commits.sort((a, b) => {
      if (a.commit.committer.time > b.commit.committer.time) {
        return -1;
      } else if (a.commit.committer.time < b.commit.committer.time) {
        return 1;
      }

      return 0;
    });

    for (const { commit } of commits) {
      const time = commit.committer.time * 1000;
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
          week: 0,
        });
        groupDate = date;
      }
      groupedCommits[groupedCommits.length - 1].commits.push({ commit });
    }
    return groupedCommits;
  } catch (err) {
    throw new ApiError(
      "Not able to create commit history, please consider updating seed HTTP API.",
    );
  }
}

export function groupCommitsByWeek(commits: number[]): WeeklyActivity[] {
  const groupedCommits: WeeklyActivity[] = [];
  let groupDate: Date | undefined = undefined;

  if (commits.length === 0) {
    return [];
  }

  commits = commits.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

  // A accumulator that increments by the amount of weeks between weekly commit groups
  let weekAccumulator = Math.floor(
    getDaysPassed(new Date(commits[0] * 1000), new Date()) / 7,
  );

  // Loops over all commits and stores them by week with some additional metadata in groupedCommits.
  for (const commit of commits) {
    const time = commit * 1000;
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
        week: Math.floor(daysPassed / 7) + weekAccumulator,
      });
      groupDate = date;
      weekAccumulator += Math.floor(daysPassed / 7);
    }
    groupedCommits[groupedCommits.length - 1].commits.push(commit);
  }

  return groupedCommits;
}
