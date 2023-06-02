import type { Comment, ThreadUpdateAction } from "./comment.js";
import type { ZodSchema } from "zod";

import { commentSchema } from "./comment.js";

import {
  array,
  literal,
  number,
  optional,
  object,
  string,
  tuple,
  union,
} from "zod";

export type PatchState =
  | { status: "draft" }
  | { status: "open"; conflicts?: [string, string][] }
  | { status: "archived" }
  | { status: "merged"; revision: string; commit: string };

const patchStateSchema = union([
  object({
    status: literal("draft"),
  }),
  object({
    status: literal("open"),
    conflicts: array(tuple([string(), string()])).optional(),
  }),
  object({
    status: literal("archived"),
  }),
  object({
    status: literal("merged"),
    revision: string(),
    commit: string(),
  }),
]) satisfies ZodSchema<PatchState>;

export interface Merge {
  author: { id: string; alias?: string };
  revision: string;
  commit: string;
  timestamp: number;
}

const mergeSchema = object({
  author: object({ id: string(), alias: string().optional() }),
  revision: string(),
  commit: string(),
  timestamp: number(),
}) satisfies ZodSchema<Merge>;

interface CodeLocation {
  path: string;
  commit: string;
  lines: {
    start: number;
    end: number;
  };
}

const codeLocationSchema = object({
  path: string(),
  commit: string(),
  lines: object({
    start: number(),
    end: number(),
  }),
}) satisfies ZodSchema<CodeLocation>;

interface CodeComment {
  location: CodeLocation;
  comment: string;
  timestamp: number;
}

const codeCommentSchema = object({
  location: codeLocationSchema,
  comment: string(),
  timestamp: number(),
}) satisfies ZodSchema<CodeComment>;

type Verdict = "accept" | "reject";

export interface Review {
  author: { id: string; alias?: string };
  verdict?: Verdict | null;
  comment?: string | null;
  inline: CodeComment[];
  timestamp: number;
}

const reviewSchema = object({
  author: object({ id: string(), alias: string().optional() }),
  verdict: optional(union([literal("accept"), literal("reject")]).nullable()),
  comment: optional(string().nullable()),
  inline: array(codeCommentSchema),
  timestamp: number(),
}) satisfies ZodSchema<Review>;

export interface Revision {
  id: string;
  author: { id: string; alias?: string };
  description: string;
  base: string;
  oid: string;
  refs: string[];
  discussions: Comment[];
  reviews: Review[];
  timestamp: number;
}

const revisionSchema = object({
  id: string(),
  author: object({ id: string(), alias: string().optional() }),
  description: string(),
  base: string(),
  oid: string(),
  refs: array(string()),
  discussions: array(commentSchema),
  reviews: array(reviewSchema),
  timestamp: number(),
}) satisfies ZodSchema<Revision>;

export interface Patch {
  id: string;
  author: { id: string; alias?: string };
  title: string;
  state: PatchState;
  target: string;
  tags: string[];
  merges: Merge[];
  reviewers: string[];
  revisions: Revision[];
}

export const patchSchema = object({
  id: string(),
  author: object({ id: string(), alias: string().optional() }),
  title: string(),
  state: patchStateSchema,
  target: string(),
  tags: array(string()),
  merges: array(mergeSchema),
  reviewers: array(string()),
  revisions: array(revisionSchema),
}) satisfies ZodSchema<Patch>;

export const patchesSchema = array(patchSchema) satisfies ZodSchema<Patch[]>;

export type PatchUpdateAction =
  | { type: "edit"; title: string; description: string; target: string }
  | { type: "editRevision"; revision: string; description: string }
  | { type: "tag"; add: string[]; remove: string[] }
  | { type: "revision"; description: string; base: string; oid: string }
  | { type: "lifecycle"; state: PatchState }
  | { type: "redact"; revision: string }
  | {
      type: "review";
      author: { id: string; alias?: string };
      revision: string;
      verdict?: Verdict;
      comment?: string;
      inline: CodeComment;
    }
  | { type: "merge"; revision: string; commit: string }
  | { type: "thread"; revision: string; action: ThreadUpdateAction };
