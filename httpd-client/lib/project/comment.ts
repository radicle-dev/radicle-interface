import type { z } from "zod";
import { array, number, object, string, tuple } from "zod";

export type Comment = z.infer<typeof commentSchema>;
export type Embed = z.infer<typeof commentSchema>["embeds"][0];

export const commentSchema = object({
  id: string(),
  author: object({ id: string(), alias: string().optional() }),
  body: string(),
  edits: array(
    object({
      author: object({ id: string(), alias: string().optional() }),
      body: string(),
      embeds: array(object({ name: string(), content: string() })),
      timestamp: number(),
    }),
  ),
  embeds: array(object({ name: string(), content: string() })),
  reactions: array(tuple([string(), string()])),
  timestamp: number(),
  replyTo: string().nullable(),
});
