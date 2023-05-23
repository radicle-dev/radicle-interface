import type { Comment, ThreadUpdateAction } from "./comment.js";
import type { ZodSchema } from "zod";

import { commentSchema } from "./comment.js";

import {
  array,
  literal,
  number,
  optional,
  strictObject,
  string,
  union,
} from "zod";

export type PatchState =
  | { status: "draft" }
  | { status: "open" }
  | { status: "archived" }
  | { status: "merged" };

const patchStateSchema = union([
  strictObject({ status: literal("draft") }),
  strictObject({ status: literal("open") }),
  strictObject({ status: literal("archived") }),
  strictObject({ status: literal("merged") }),
]) satisfies ZodSchema<PatchState>;

export interface Merge {
  author: { id: string; alias?: string };
  commit: string;
  timestamp: number;
}

const mergeSchema = strictObject({
  author: strictObject({ id: string(), alias: string().optional() }),
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

const codeLocationSchema = strictObject({
  path: string(),
  commit: string(),
  lines: strictObject({
    start: number(),
    end: number(),
  }),
}) satisfies ZodSchema<CodeLocation>;

interface CodeComment {
  location: CodeLocation;
  comment: string;
  timestamp: number;
}

const codeCommentSchema = strictObject({
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

const reviewSchema = strictObject({
  author: strictObject({ id: string(), alias: string().optional() }),
  verdict: optional(union([literal("accept"), literal("reject")]).nullable()),
  comment: optional(string().nullable()),
  inline: array(codeCommentSchema),
  timestamp: number(),
}) satisfies ZodSchema<Review>;

export interface Revision {
  id: string;
  description: string;
  base: string;
  oid: string;
  refs: string[];
  discussions: Comment[];
  reviews: Review[];
  merges: Merge[];
  timestamp: number;
}

const revisionSchema = strictObject({
  id: string(),
  description: string(),
  base: string(),
  oid: string(),
  refs: array(string()),
  discussions: array(commentSchema),
  reviews: array(reviewSchema),
  merges: array(mergeSchema),
  timestamp: number(),
}) satisfies ZodSchema<Revision>;

export interface Patch {
  id: string;
  author: { id: string; alias?: string };
  title: string;
  description: string;
  state: PatchState;
  target: string;
  tags: string[];
  revisions: Revision[];
}

export const patchSchema = strictObject({
  id: string(),
  author: strictObject({ id: string(), alias: string().optional() }),
  title: string(),
  description: string(),
  state: patchStateSchema,
  target: string(),
  tags: array(string()),
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
