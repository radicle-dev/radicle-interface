import type { z } from "zod";
import { array, boolean, number, object, string } from "zod";
import { authorSchema, codeLocationSchema } from "../shared";

export type Comment = z.infer<typeof commentSchema>;
export type Embed = Comment["embeds"][0];
export type Reaction = Comment["reactions"][0];

export const commentSchema = object({
  id: string(),
  author: authorSchema,
  body: string(),
  edits: array(
    object({
      author: authorSchema,
      body: string(),
      embeds: array(object({ name: string(), content: string() })),
      timestamp: number(),
    }),
  ),
  embeds: array(object({ name: string(), content: string() })),
  reactions: array(object({ emoji: string(), authors: array(authorSchema) })),
  timestamp: number(),
  location: codeLocationSchema.nullable().optional(),
  resolved: boolean(),
  replyTo: string().nullable(),
});
