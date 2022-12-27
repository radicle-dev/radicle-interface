import type { Author, PeerInfo } from "@app/lib/cobs";
import type { Comment, Thread } from "@app/lib/issue";
import type { Commit, DiffStats } from "@app/lib/commit";
import type { Diff } from "@app/lib/diff";
import type { Host } from "@app/lib/api";
import type { PeerId, Id } from "@app/lib/project";

import { Request } from "@app/lib/api";

export interface IPatch {
  id: string;
  author: Author;
  title: string;
  state: string;
  target: string;
  labels: string[];
  revisions: Revision[];
  timestamp: number;
}

export enum PatchTab {
  Timeline = "timeline",
  Diff = "diff",
}

export interface Revision {
  id: string;
  peer: PeerId;
  base: string;
  oid: string;
  comment: Comment;
  discussion: Thread[];
  reviews: Record<Id, Review>;
  merges: Merge[];
  changeset: {
    diff: Diff;
    commits: Commit[];
    stats: DiffStats;
  } | null;
  timestamp: number;
}

export interface Review {
  author: Author;
  verdict: Verdict | null;
  comment: Thread;
  inline: CodeComment[];
  timestamp: number;
}

export type Verdict = "accept" | "reject";

export interface CodeComment {
  location: CodeLocation;
  comment: Comment;
}

export interface CodeLocation {
  lines: number;
  commit: string;
  blob: string;
}

export interface Merge {
  peer: PeerInfo;
  commit: string;
  timestamp: number;
}

export function groupPatches(patches: Patch[]) {
  return patches.reduce(
    (acc: { [state: string]: Patch[] }, patch) => {
      acc[patch.state].push(patch);
      return acc;
    },
    { proposed: [] as Patch[], draft: [] as Patch[], archived: [] as Patch[] },
  );
}

export class Patch implements IPatch {
  id: string;
  author: Author;
  title: string;
  state: string;
  target: string;
  labels: string[];
  revisions: Revision[];
  timestamp: number;

  constructor(patch: IPatch) {
    this.id = patch.id;
    this.author = patch.author;
    this.title = patch.title;
    this.state = patch.state;
    this.target = patch.target;
    this.labels = patch.labels;
    this.revisions = patch.revisions;
    this.timestamp = patch.timestamp;
  }

  // Counts the amount of comments and replies in a discussion
  countComments(rev: number): number {
    return this.revisions[rev].discussion.reduce((acc, comment) => {
      if (comment.replies) return acc + comment.replies.length + 1; // We add all replies and 1 for each comment in this loop.
      return acc + 1; // If there are no replies, we simply add 1 for the comment in this loop.
    }, 0);
  }

  createTimeline(rev: number) {
    const timeline: TimelineElement[] = [];
    const comment: TimelineElement = {
      type: TimelineType.Comment,
      timestamp: this.revisions[rev].comment.timestamp,
      inner: this.revisions[rev].comment,
    };
    const discussions = this.revisions[rev].discussion.map(
      (comment): TimelineElement => {
        return {
          type: TimelineType.Thread,
          timestamp: comment.timestamp,
          inner: comment,
        };
      },
    );
    const reviews = Object.entries(this.revisions[rev].reviews).map(
      ([, review]): TimelineElement => {
        return {
          type: TimelineType.Review,
          timestamp: review.timestamp,
          inner: review,
        };
      },
    );
    const merges = this.revisions[rev].merges.map((merge): TimelineElement => {
      return {
        type: TimelineType.Merge,
        timestamp: merge.timestamp,
        inner: merge,
      };
    });
    timeline.push(comment, ...discussions, ...merges, ...reviews);
    return timeline.sort((a, b) => a.timestamp - b.timestamp);
  }

  static async getPatches(id: string, host: Host): Promise<Patch[]> {
    const response: IPatch[] = await new Request(
      `projects/${id}/patches`,
      host,
    ).get();
    return response.map(patch => new Patch(patch));
  }

  static async getPatch(id: string, patch: string, host: Host): Promise<Patch> {
    const response: IPatch = await new Request(
      `projects/${id}/patches/${patch}`,
      host,
    ).get();
    return new Patch(response);
  }
}

export const formatVerdict = (verdict: string | null): string => {
  switch (verdict) {
    case "accept":
      return "approved this revision";

    case "reject":
      return "rejected this revision";

    default:
      return "reviewed and left a comment";
  }
};

export enum TimelineType {
  Comment,
  Thread,
  Review,
  Merge,
}

export type TimelineElement =
  | {
      type: TimelineType.Thread;
      inner: Thread;
      timestamp: number;
    }
  | {
      type: TimelineType.Comment;
      inner: Comment;
      timestamp: number;
    }
  | {
      type: TimelineType.Merge;
      inner: Merge;
      timestamp: number;
    }
  | {
      type: TimelineType.Review;
      inner: Review;
      timestamp: number;
    };
