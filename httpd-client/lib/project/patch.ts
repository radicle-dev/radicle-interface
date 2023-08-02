import type { Comment } from "./comment.js";
import type { ZodSchema, z } from "zod";

import { commentSchema } from "./comment.js";

import {
  array,
  boolean,
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

type Verdict = "accept" | "reject";

export interface Review {
  author: { id: string; alias?: string };
  verdict?: Verdict | null;
  summary: string | null;
  comments: string[];
  timestamp: number;
}

const reviewSchema = object({
  author: object({ id: string(), alias: string().optional() }),
  verdict: optional(union([literal("accept"), literal("reject")]).nullable()),
  comments: array(string()),
  summary: string().nullable(),
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
  labels: string[];
  merges: Merge[];
  assignees: string[];
  revisions: Revision[];
}

export const patchSchema = object({
  id: string(),
  author: object({ id: string(), alias: string().optional() }),
  title: string(),
  state: patchStateSchema,
  target: string(),
  labels: array(string()),
  merges: array(mergeSchema),
  assignees: array(string()),
  revisions: array(revisionSchema),
}) satisfies ZodSchema<Patch>;

export const patchesSchema = array(patchSchema) satisfies ZodSchema<Patch[]>;

export type LifecycleState =
  | { status: "draft" }
  | { status: "open" }
  | { status: "archived" };

export type Range =
  | {
      type: "lines";
      range: { start: number; end: number };
    }
  | {
      type: "chars";
      line: number;
      range: { start: number; end: number };
    };

export type CodeLocation = {
  path: string;
  old?: Range;
  new?: Range;
};

export type PatchUpdateAction =
  | { type: "edit"; title: string; target: "delegates" }
  | { type: "label"; labels: string[] }
  | { type: "assign"; assignees: string[] }
  | { type: "merge"; revision: string; commit: string }
  | { type: "lifecycle"; state: LifecycleState }
  | {
      type: "review";
      revision: string;
      summary?: string;
      verdict?: Verdict | null;
    }
  | { type: "review.edit"; review: string; summary?: string }
  | { type: "review.redact"; review: string }
  | {
      type: "review.comment";
      review: string;
      body: string;
      location: CodeLocation;
    }
  | {
      type: "review.comment.edit";
      review: string;
      comment: string;
      body: string;
    }
  | {
      type: "review.comment.redact";
      review: string;
      comment: string;
    }
  | {
      type: "review.comment.react";
      review: string;
      comment: string;
      reaction: string;
      active: boolean;
    }
  | { type: "revision"; description: string; base: string; oid: string }
  | { type: "revision.edit"; revision: string; description: string }
  | { type: "revision.redact"; revision: string }
  | {
      type: "revision.comment";
      revision: string;
      body: string;
      replyTo: string;
    }
  | {
      type: "revision.comment.edit";
      revision: string;
      comment: string;
      body: string;
    }
  | {
      type: "revision.comment.redact";
      revision: string;
      comment: string;
    }
  | {
      type: "revision.comment.react";
      revision: string;
      comment: string;
      reaction: string;
      active: boolean;
    };

export const patchCreateSchema = object({
  title: string(),
  description: string(),
  target: string(),
  oid: string(),
  labels: array(string()),
});

export type PatchCreate = z.infer<typeof patchCreateSchema>;

export const patchCreatedSchema = object({
  success: boolean(),
  id: string(),
});

export type PatchCreated = z.infer<typeof patchCreatedSchema>;
