import type { BaseUrl } from "./lib/fetcher.js";
import type {
  Blob,
  DiffResponse,
  Project,
  ProjectListQuery,
  Remote,
  Tree,
  TreeStats,
} from "./lib/project.js";
import type {
  SuccessResponse,
  CodeLocation,
  Range,
  Policy,
  Scope,
} from "./lib/shared.js";
import type { Comment, Embed, Reaction } from "./lib/project/comment.js";
import type {
  Commit,
  CommitBlob,
  CommitHeader,
  ChangesetWithDiff,
  ChangesetWithoutDiff,
  Diff,
  DiffBlob,
  DiffContent,
  DiffFile,
  HunkLine,
} from "./lib/project/commit.js";
import type { Issue, IssueState } from "./lib/project/issue.js";
import type {
  LifecycleState,
  Merge,
  Patch,
  PatchState,
  PatchUpdateAction,
  Review,
  Revision,
  Verdict,
} from "./lib/project/patch.js";
import type { RequestOptions } from "./lib/fetcher.js";
import type { ZodSchema } from "zod";

import { z, array, literal, number, object, string, union } from "zod";

import * as project from "./lib/project.js";
import * as profile from "./lib/profile.js";
import * as session from "./lib/session.js";
import { Fetcher } from "./lib/fetcher.js";
import { nodeConfigSchema, successResponseSchema } from "./lib/shared.js";

export type {
  BaseUrl,
  Blob,
  ChangesetWithDiff,
  ChangesetWithoutDiff,
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
  Policy,
  Project,
  ProjectListQuery,
  Range,
  Reaction,
  Remote,
  Review,
  Revision,
  Scope,
  TreeStats,
  Tree,
  Verdict,
};

export type Node = z.infer<typeof nodeSchema>;

const nodeSchema = object({
  id: string(),
  version: string(),
  config: nodeConfigSchema.nullable(),
  state: union([literal("running"), literal("stopped")]),
});

export type NodeInfo = z.infer<typeof nodeInfoSchema>;

const nodeInfoSchema = object({
  message: string(),
  service: string(),
  version: string(),
  apiVersion: string(),
  nid: string(),
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
  repos: { total: number };
}

const nodeStatsSchema = object({
  repos: object({ total: number() }),
}) satisfies ZodSchema<NodeStats>;

export class HttpdClient {
  #fetcher: Fetcher;

  public baseUrl: BaseUrl;
  public project: project.Client;
  public profile: profile.Client;
  public session: session.Client;

  public constructor(baseUrl: BaseUrl) {
    this.baseUrl = baseUrl;
    this.#fetcher = new Fetcher(this.baseUrl);

    this.project = new project.Client(this.#fetcher);
    this.profile = new profile.Client(this.#fetcher);
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
