import type { BaseUrl } from "./lib/fetcher.js";
import type {
  Blob,
  Project,
  Remote,
  Tree,
  DiffResponse,
} from "./lib/project.js";
import type { Comment } from "./lib/project/comment.js";
import type {
  Commit,
  CommitHeader,
  Diff,
  DiffAddedDeletedModifiedChangeset,
  DiffCopiedMovedChangeset,
  HunkLine,
} from "./lib/project/commit.js";
import type { Issue, IssueState } from "./lib/project/issue.js";
import type {
  Merge,
  Patch,
  PatchState,
  Review,
  Revision,
} from "./lib/project/patch.js";
import type { RequestOptions, Method } from "./lib/fetcher.js";
import type { ZodSchema } from "zod";

import { array, literal, number, object, string, union } from "zod";

import * as project from "./lib/project.js";
import * as session from "./lib/session.js";
import { Fetcher } from "./lib/fetcher.js";

export type {
  BaseUrl,
  Blob,
  Comment,
  Commit,
  CommitHeader,
  Diff,
  DiffAddedDeletedModifiedChangeset,
  DiffCopiedMovedChangeset,
  DiffResponse,
  HunkLine,
  Issue,
  IssueState,
  Merge,
  Patch,
  PatchState,
  Project,
  Remote,
  Review,
  Revision,
  Tree,
};

export interface Node {
  id: string;
}

const nodeSchema = object({
  id: string(),
}) satisfies ZodSchema<Node>;

export interface NodeInfo {
  message: string;
  service: string;
  version: string;
  node: Node;
  path: string;
  links: { href: string; rel: string; type: Method }[];
}

const nodeInfoSchema = object({
  message: string(),
  service: string(),
  version: string(),
  node: nodeSchema,
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
}) satisfies ZodSchema<NodeInfo>;

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
