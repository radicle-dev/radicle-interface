import type { ZodSchema } from "zod";

import { array, boolean, literal, number, object, string, union } from "zod";

export interface SuccessResponse {
  success: true;
}

export const successResponseSchema = object({
  success: literal(true),
}) satisfies ZodSchema<SuccessResponse>;

export const nodeConfigSchema = object({
  alias: string(),
  peers: union([
    object({ type: literal("static") }),
    object({ type: literal("dynamic"), target: number() }),
  ]),
  listen: array(string()),
  connect: array(string()),
  externalAddresses: array(string()),
  network: union([literal("main"), literal("test")]),
  relay: boolean(),
  limits: object({
    routingMaxSize: number(),
    routingMaxAge: number(),
    fetchConcurrency: number(),
    gossipMaxAge: number(),
    maxOpenFiles: number(),
    rate: object({
      inbound: object({
        fillRate: number(),
        capacity: number(),
      }),
      outbound: object({
        fillRate: number(),
        capacity: number(),
      }),
    }),
  }),
  policy: union([literal("allow"), literal("block")]),
  scope: union([literal("followed"), literal("all")]),
});
