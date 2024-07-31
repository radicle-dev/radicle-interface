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
  Config,
  SeedingPolicy,
  DefaultSeedingPolicy,
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
  Review,
  Revision,
  Verdict,
} from "./lib/project/patch.js";
import type { RequestOptions } from "./lib/fetcher.js";
import type { ZodSchema } from "zod";

import { z, array, literal, number, object, string, union } from "zod";

import * as project from "./lib/project.js";
import { Fetcher } from "./lib/fetcher.js";
import {
  nodeConfigSchema,
  scopeSchema,
  seedingPolicySchema,
} from "./lib/shared.js";

export type {
  BaseUrl,
  Blob,
  ChangesetWithDiff,
  ChangesetWithoutDiff,
  Comment,
  Commit,
  CommitBlob,
  CommitHeader,
  Config,
  DefaultSeedingPolicy,
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
  Project,
  ProjectListQuery,
  Reaction,
  Remote,
  Review,
  Revision,
  SeedingPolicy,
  TreeStats,
  Tree,
  Verdict,
};

export type Node = z.infer<typeof nodeSchema>;

const nodeSchema = object({
  id: string(),
  agent: string(),
  config: nodeConfigSchema.nullable(),
  state: union([literal("running"), literal("stopped")]),
  avatarUrl: string().optional(),
  bannerUrl: string().optional(),
  description: string().optional(),
});

export type NodeIdentity = z.infer<typeof nodeIdentitySchema>;

const nodeIdentitySchema = object({
  alias: string().nullable(),
  did: string(),
  ssh: object({
    full: string(),
    hash: string(),
  }),
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

export type NodePolicies = z.infer<typeof nodePoliciesSchema>;

const nodePoliciesSchema = object({
  rid: string(),
  policy: union([
    object({ policy: literal("block") }),
    object({
      policy: literal("allow"),
      scope: scopeSchema,
    }),
  ]),
});

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

  public constructor(baseUrl: BaseUrl) {
    this.baseUrl = baseUrl;
    this.#fetcher = new Fetcher(this.baseUrl);

    this.project = new project.Client(this.#fetcher);
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

  public async getPolicies(options?: RequestOptions): Promise<NodePolicies[]> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: "node/policies/repos",
        options,
      },
      array(nodePoliciesSchema),
    );
  }

  public async getPolicyById(
    id: string,
    options?: RequestOptions,
  ): Promise<SeedingPolicy> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: `node/policies/repos/${id}`,
        options,
      },
      seedingPolicySchema,
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

  public async getNodeIdentity(
    id: string,
    options?: RequestOptions,
  ): Promise<NodeIdentity> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: `nodes/${id}`,
        options,
      },
      nodeIdentitySchema,
    );
  }

  public async getNodeInventory(
    id: string,
    options?: RequestOptions,
  ): Promise<string[]> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: `nodes/${id}/inventory`,
        options,
      },
      array(string()),
    );
  }
}
