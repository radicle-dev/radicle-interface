import type { Embed } from "./comment.js";
import type { ZodSchema, z } from "zod";
import type { CodeLocation } from "../shared.js";

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
import { authorSchema } from "../shared.js";

export type PatchState = z.infer<typeof patchStateSchema>;

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
]);

export type Merge = z.infer<typeof mergeSchema>;

const mergeSchema = object({
  author: authorSchema,
  revision: string(),
  commit: string(),
  timestamp: number(),
});

export type Verdict = "accept" | "reject";

const reviewSchema = object({
  author: authorSchema,
  verdict: optional(union([literal("accept"), literal("reject")]).nullable()),
  comments: array(commentSchema),
  summary: string().nullable(),
  timestamp: number(),
});

export type Review = z.infer<typeof reviewSchema>;

const revisionSchema = object({
  id: string(),
  author: authorSchema,
  description: string(),
  edits: array(
    object({
      author: authorSchema,
      body: string(),
      embeds: array(object({ name: string(), content: string() })),
      timestamp: number(),
    }),
  ),
  reactions: array(
    object({
      emoji: string(),
      authors: array(authorSchema),
    }),
  ),
  base: string(),
  oid: string(),
  refs: array(string()),
  discussions: array(commentSchema),
  reviews: array(reviewSchema),
  timestamp: number(),
});

export type Revision = z.infer<typeof revisionSchema>;

export const patchSchema = object({
  id: string(),
  author: authorSchema,
  title: string(),
  state: patchStateSchema,
  target: string(),
  labels: array(string()),
  merges: array(mergeSchema),
  assignees: array(string()),
  revisions: array(revisionSchema),
});

export type Patch = z.infer<typeof patchSchema>;

export const patchesSchema = array(patchSchema) satisfies ZodSchema<Patch[]>;

export type LifecycleState =
  | { status: "draft" }
  | { status: "open" }
  | { status: "archived" };

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
      replyTo?: string;
      embeds?: Embed[];
    }
  | {
      type: "review.comment.edit";
      review: string;
      comment: string;
      body: string;
      embeds: Embed[];
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
  | {
      type: "revision.edit";
      revision: string;
      description: string;
      embeds?: Embed[];
    }
  | {
      type: "revision.react";
      revision: string;
      reaction: string;
      location?: CodeLocation;
      active: boolean;
    }
  | { type: "revision.redact"; revision: string }
  | {
      type: "revision.comment";
      revision: string;
      body: string;
      embeds?: Embed[];
      location?: CodeLocation;
      replyTo?: string;
    }
  | {
      type: "revision.comment.edit";
      revision: string;
      comment: string;
      body: string;
      embeds: Embed[];
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
