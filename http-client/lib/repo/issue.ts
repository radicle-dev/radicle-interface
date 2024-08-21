import type { ZodSchema, z } from "zod";
import { array, literal, object, string, union } from "zod";

import { commentSchema } from "./comment.js";
import { authorSchema } from "../shared.js";

export type IssueState =
  | { status: "open" }
  | { status: "closed"; reason: "other" | "solved" };

const issueStateSchema = union([
  object({ status: literal("open") }),
  object({
    status: literal("closed"),
    reason: union([literal("other"), literal("solved")]),
  }),
]) satisfies ZodSchema<IssueState>;

export const issueSchema = object({
  id: string(),
  author: authorSchema,
  title: string(),
  state: issueStateSchema,
  discussion: array(commentSchema),
  labels: array(string()),
  assignees: array(authorSchema),
});

export type Issue = z.infer<typeof issueSchema>;

export const issuesSchema = array(issueSchema) satisfies ZodSchema<Issue[]>;
