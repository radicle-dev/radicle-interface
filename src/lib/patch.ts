import type { Author, Comment } from "@app/lib/cobs";
import type { CommitHeader } from "@app/lib/commit";
import type { Diff } from "@app/lib/diff";
import type { Host } from "@app/lib/api";

import { Request } from "@app/lib/api";

interface IPatch {
  id: string;
  author: Author;
  title: string;
  description: string;
  state: PatchState;
  target: string;
  tags: string[];
  revisions: Revision[];
}

export interface Revision {
  id: string;
  description: string;
  base: string;
  oid: string;
  refs: string[];
  discussions: Comment[];
  reviews: [string, Review][];
  merges: Merge[];
  timestamp: number;
}

export interface Review {
  verdict?: "accept" | "reject";
  comment?: string;
  inline: CodeComment[];
  timestamp: number;
}

export interface CodeComment {
  location: CodeLocation;
  comment: string;
  timestamp: number;
}

interface CodeLocation {
  path: string;
  commit: string;
  lines: {
    start: number;
    end: number;
  };
}

export interface Merge {
  node: string;
  commit: string;
  timestamp: number;
}

export type PatchState =
  | { status: "draft" }
  | { status: "proposed" }
  | { status: "archived" };

export class Patch {
  id: string;
  author: Author;
  title: string;
  description: string;
  state: PatchState;
  target: string;
  tags: string[];
  revisions: Revision[];

  constructor(patch: IPatch) {
    this.id = patch.id;
    this.author = patch.author;
    this.title = patch.title;
    this.description = patch.description;
    this.state = patch.state;
    this.target = patch.target;
    this.tags = patch.tags;
    this.revisions = patch.revisions;
  }

  async editTags(
    project: string,
    add: string[],
    remove: string[],
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/patches/${this.id}`, host).patch(
      {
        type: "tag",
        add,
        remove,
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  static async getPatches(id: string, host: Host): Promise<Patch[]> {
    const response: IPatch[] = await new Request(
      `projects/${id}/patches`,
      host,
    ).get();
    return response.map(patch => new Patch(patch));
  }

  async replyComment(
    project: string,
    revision: string,
    body: string,
    replyTo: string,
    host: Host,
    session: string,
  ): Promise<void> {
    await new Request(`projects/${project}/patches/${this.id}`, host).patch(
      {
        type: "thread",
        revision,
        action: {
          type: "comment",
          body,
          replyTo,
        },
      },
      { Authorization: `Bearer ${session}` },
    );
  }

  async getPatchDiff(
    project: string,
    revision: Revision,
    host: Host,
  ): Promise<{ commits: CommitHeader[]; diff: Diff }> {
    return await new Request(
      `projects/${project}/diff/${revision.base}/${revision.oid}`,
      host,
    ).get();
  }

  static async getPatch(id: string, patch: string, host: Host): Promise<Patch> {
    const response: IPatch = await new Request(
      `projects/${id}/patches/${patch}`,
      host,
    ).get();
    return new Patch(response);
  }
}
