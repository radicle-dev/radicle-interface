import type { ZodSchema } from "zod";
import { array, number, record, strictObject, string } from "zod";

export type ThreadUpdateAction =
  | { type: "comment"; body: string; replyTo?: string }
  | { type: "edit"; id: string; body: string }
  | { type: "redact"; id: string }
  | {
      type: "react";
      to: string;
      reaction: { emoji: string };
      active: boolean;
    };

export interface Comment {
  id: string;
  author: { id: string };
  body: string;
  reactions: Record<string, number>[];
  timestamp: number;
  replyTo: string | null;
}

export const commentSchema = strictObject({
  id: string(),
  author: strictObject({ id: string() }),
  body: string(),
  reactions: array(record(string(), number())),
  timestamp: number(),
  replyTo: string().nullable(),
}) satisfies ZodSchema<Comment>;
