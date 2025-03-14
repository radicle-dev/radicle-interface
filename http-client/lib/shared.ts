import type { z } from "zod";

import { array, boolean, literal, number, object, string, union } from "zod";

export const scopeSchema = union([literal("followed"), literal("all")]);

export const seedingPolicySchema = union([
  object({
    policy: literal("block"),
  }),
  object({
    policy: literal("allow"),
    scope: scopeSchema,
  }),
]);

export type SeedingPolicy = z.infer<typeof seedingPolicySchema>;

const defaultSeedingPolicySchema = union([
  object({
    default: literal("block"),
  }),
  object({
    default: literal("allow"),
    scope: scopeSchema,
  }),
]);

export const nodeConfigSchema = object({
  alias: string(),
  peers: union([
    object({ type: literal("static") }),
    object({ type: literal("dynamic") }),
  ]),
  listen: array(string()),
  connect: array(string()),
  externalAddresses: array(string()),
  proxy: string().optional(),
  onion: union([
    object({
      mode: literal("proxy"),
      address: string(),
    }),
    object({ mode: literal("forward") }),
  ]).optional(),
  log: union([
    literal("ERROR"),
    literal("WARN"),
    literal("INFO"),
    literal("DEBUG"),
    literal("TRACE"),
  ]),
  network: union([literal("main"), literal("test")]),
  relay: union([literal("always"), literal("never"), literal("auto")]),
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
    connection: object({
      inbound: number(),
      outbound: number(),
    }),
  }),
  workers: number(),
  seedingPolicy: defaultSeedingPolicySchema,
});

export type DefaultSeedingPolicy = z.infer<typeof defaultSeedingPolicySchema>;

export const configSchema = object({
  publicExplorer: string(),
  preferredSeeds: array(string()),
  cli: object({ hints: boolean() }),
  web: object({
    pinned: object({
      repositories: array(string()),
    }),
    bannerUrl: string().optional(),
    avatarUrl: string().optional(),
    description: string().optional(),
  }),
  node: nodeConfigSchema,
});

export type Config = z.infer<typeof configSchema>;

export const rangeSchema = union([
  object({
    type: literal("lines"),
    range: object({ start: number(), end: number() }),
  }),
  object({
    type: literal("chars"),
    line: number(),
    range: object({ start: number(), end: number() }),
  }),
]);

export type Range = z.infer<typeof rangeSchema>;

export const codeLocationSchema = object({
  commit: string(),
  path: string(),
  old: rangeSchema.optional(),
  new: rangeSchema.optional(),
});

export type Author = z.infer<typeof authorSchema>;

export const authorSchema = object({
  id: string(),
  alias: string().optional(),
});
