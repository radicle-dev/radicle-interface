import * as zod from "zod";

interface Remote {
  heads: { [key: string]: string };
}

export const remoteSchema: zod.Schema<Remote> = zod.object({
  heads: zod.record(zod.string(), zod.string()),
});

interface Delegate {
  type: "indirect";
  urn: string;
  ids: string[];
}

export const delegateSchema: zod.Schema<Delegate> = zod.object({
  type: zod.literal("indirect"),
  urn: zod.string(),
  ids: zod.array(zod.string()),
});

export interface Project {
  urn: string;
  name: string;
  description: string;
  defaultBranch: string;
  delegates: Delegate[];
  remotes: string[];
  head: string | null;
  patches?: number;
  issues?: number;
}

export const projectSchema: zod.Schema<Project> = zod.object({
  urn: zod.string(),
  name: zod.string(),
  description: zod.string(),
  defaultBranch: zod.string(),
  delegates: zod.array(delegateSchema),
  remotes: zod.array(zod.string()),
  head: zod.string().nullable(),
  patches: zod.number().optional(),
  issues: zod.number().optional(),
});

interface Person {
  name: string;
}

interface CommitContext {
  committer?: {
    peer: {
      id: string;
      person: Person | null;
      delegate: boolean;
    };
  };
}

export const commitContextSchema: zod.Schema<CommitContext> = zod.object({
  committer: zod
    .object({
      peer: zod.object({
        id: zod.string(),
        person: zod.object({ name: zod.string() }).nullable(),
        delegate: zod.boolean(),
      }),
    })
    .optional(),
});

interface Author {
  email: string;
  name: string;
}

export const authorSchema: zod.Schema<Author> = zod.object({
  email: zod.string(),
  name: zod.string(),
});

interface CommitHeader {
  author: Author;
  committer: Author;
  committerTime: number;
  description: string;
  sha1: string;
  summary: string;
}

export const commitHeaderSchema: zod.Schema<CommitHeader> = zod.object({
  author: authorSchema,
  committer: authorSchema,
  committerTime: zod.number(),
  description: zod.string(),
  sha1: zod.string(),
  summary: zod.string(),
});

interface CommitMetadata {
  header: CommitHeader;
  context: CommitContext;
}

interface Stats {
  commits: number;
  contributors: number;
}

interface CommitsHistory {
  headers: CommitMetadata[];
  stats: Stats;
}

export const commitsHistorySchema: zod.Schema<CommitsHistory> = zod.object({
  headers: zod.array(
    zod.object({
      header: commitHeaderSchema,
      context: commitContextSchema,
    }),
  ),
  stats: zod.object({
    commits: zod.number(),
    contributors: zod.number(),
  }),
});
