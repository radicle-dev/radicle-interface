import type { BaseUrl } from "./lib/fetcher.js";
import type {
  Blob,
  Project,
  Remote,
  Tree,
  DiffResponse,
} from "./lib/project.js";
import type { SuccessResponse } from "./lib/shared.js";
import type { Comment, Embed } from "./lib/project/comment.js";
import type {
  Commit,
  CommitBlob,
  CommitHeader,
  Diff,
  DiffBlob,
  DiffContent,
  DiffFile,
  HunkLine,
} from "./lib/project/commit.js";
import type { Issue, IssueState } from "./lib/project/issue.js";
import type {
  CodeLocation,
  LifecycleState,
  Merge,
  Patch,
  PatchState,
  PatchUpdateAction,
  Range,
  Review,
  Revision,
  Verdict,
} from "./lib/project/patch.js";
import type { RequestOptions } from "./lib/fetcher.js";
import type { ZodSchema } from "zod";

import { z, array, boolean, literal, number, object, string, union } from "zod";

import * as project from "./lib/project.js";
import * as session from "./lib/session.js";
import { Fetcher } from "./lib/fetcher.js";
import { successResponseSchema } from "./lib/shared.js";

export type {
  BaseUrl,
  Blob,
  CodeLocation,
  Comment,
  Commit,
  CommitBlob,
  CommitHeader,
  Diff,
  DiffBlob,
  DiffContent,
  DiffFile,
  DiffResponse,
  Embed,
  HunkLine,
  Issue,
  IssueState,
  LifecycleState,
  Merge,
  Patch,
  PatchState,
  PatchUpdateAction,
  Project,
  Range,
  Remote,
  Review,
  Revision,
  Tree,
  Verdict,
};

export type Node = z.infer<typeof nodeSchema>;

const nodeSchema = object({
  id: string(),
  config: object({
    alias: string(),
    peers: union([
      object({ type: literal("static") }),
      object({ type: literal("dynamic"), target: number() }),
    ]),
    connect: array(string()),
    externalAddresses: array(string()),
    network: union([literal("main"), literal("test")]),
    relay: boolean(),
    limits: object({
      routingMaxSize: number(),
      routingMaxAge: number(),
      fetchConcurrency: number(),
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
  }).nullable(),
  state: union([literal("running"), literal("stopped")]),
});

export type NodeInfo = z.infer<typeof nodeInfoSchema>;

const nodeInfoSchema = object({
  message: string(),
  service: string(),
  version: string(),
  node: nodeSchema.pick({ id: true }),
  path: string(),
  links: array(
    object({
      href: string(),
      rel: string(),
      type: union([
        literal("GET"),
        literal("POST"),
        literal("PUT"),
        literal("DELETE"),
      ]),
    }),
  ),
});

export type NodeTracking = z.infer<typeof nodeTrackingSchema>;

const nodeTrackingSchema = array(
  object({
    id: string(),
    scope: string(),
    policy: string(),
  }),
);

export interface NodeStats {
  projects: { count: number };
  users: { count: number };
}

const nodeStatsSchema = object({
  projects: object({ count: number() }),
  users: object({ count: number() }),
}) satisfies ZodSchema<NodeStats>;

export class HttpdClient {
  #fetcher: Fetcher;

  public baseUrl: BaseUrl;
  public project: project.Client;
  public session: session.Client;

  public constructor(baseUrl: BaseUrl) {
    this.baseUrl = baseUrl;
    this.#fetcher = new Fetcher(this.baseUrl);

    this.project = new project.Client(this.#fetcher);
    this.session = new session.Client(this.#fetcher);
  }

  public changePort(port: number): void {
    this.baseUrl.port = port;
  }

  public get url(): string {
    return `${this.baseUrl.scheme}://${this.baseUrl.hostname}:${this.baseUrl.port}`;
  }

  public get hostname(): string {
    return this.baseUrl.hostname;
  }

  public get port(): string {
    return this.baseUrl.port.toString();
  }

  public async getNodeInfo(options?: RequestOptions): Promise<NodeInfo> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        options,
      },
      nodeInfoSchema,
    );
  }

  public async getStats(options?: RequestOptions): Promise<NodeStats> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: "stats",
        options,
      },
      nodeStatsSchema,
    );
  }

  public async getTracking(options?: RequestOptions): Promise<NodeTracking> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: "node/policies/repos",
        options,
      },
      nodeTrackingSchema,
    );
  }

  public async seedById(
    id: string,
    authToken: string,
    options?: RequestOptions,
  ): Promise<SuccessResponse> {
    return this.#fetcher.fetchOk(
      {
        method: "PUT",
        path: `node/policies/repos/${id}`,
        headers: { Authorization: `Bearer ${authToken}` },
        options,
      },
      successResponseSchema,
    );
  }

  public async stopSeedingById(
    id: string,
    authToken: string,
    options?: RequestOptions,
  ): Promise<SuccessResponse> {
    return this.#fetcher.fetchOk(
      {
        method: "DELETE",
        path: `node/policies/repos/${id}`,
        headers: { Authorization: `Bearer ${authToken}` },
        options,
      },
      successResponseSchema,
    );
  }

  public async getNode(options?: RequestOptions): Promise<Node> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: "node",
        options,
      },
      nodeSchema,
    );
  }
}
