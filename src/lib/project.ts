import type { Commit, CommitHeader, CommitsHistory } from "@app/lib/commit";
import type { Host } from "@app/lib/api";
import type { ProjectResult } from "@app/lib/search";

import * as utils from "@app/lib/utils";
import { Request } from "@app/lib/api";
import { Seed } from "@app/lib/seed";
import { isFulfilled, isOid, isRepositoryId } from "@app/lib/utils";

export type Branches = { [key: string]: string };
export type MaybeBlob = Blob | undefined;
export type MaybeTree = Tree | undefined;

// Enumerates the space below the Header component in the projects View component
export enum ProjectContent {
  Tree,
  History,
  Commit,
  Issues,
  Issue,
}

export interface ProjectInfo {
  head: string;
  id: string;
  name: string;
  description: string;
  defaultBranch: string;
  delegates: string[];
  patches: {
    open: number;
    draft: number;
    archived: number;
    merged?: number;
  };
  issues: {
    open: number;
    closed: number;
  };
}

export interface Tree {
  path: string;
  entries: Array<Entry>;
  stats: Stats;
  name: string;
  lastCommit: CommitHeader;
}

type Kind = "tree" | "blob";

export interface Stats {
  commits: number;
  contributors: number;
}

export interface Entry {
  path: string;
  name: string;
  kind: Kind;
}

export interface Blob {
  binary: boolean;
  content?: string;
  path: string;
  name: string;
  lastCommit: CommitHeader;
}

export interface Remote {
  heads: Branches;
}

export interface Person {
  name: string;
}

export interface Peer {
  id: string;
  heads: Branches;
  delegate: boolean;
}

// We need a SHA1 commit in some places, so we return early if the revision is a SHA and else we look into branches.
export function getOid(revision: string, branches?: Branches): string | null {
  if (isOid(revision)) return revision;

  if (branches) {
    const oid = branches[revision];

    if (oid) {
      return oid;
    }
  }
  return null;
}

// Parses the path consisting of a revision (eg. branch or commit) and file path into a tuple [revision, file-path]
export function parseRoute(
  input: string,
  branches: Branches,
): { path?: string; revision?: string } {
  const branch = Object.entries(branches).find(([branchName]) =>
    input.startsWith(branchName),
  );
  const commitPath = [input.slice(0, 40), input.slice(41)];
  const parsed: { path?: string; revision?: string } = {};

  if (branch) {
    const [rev, path] = [
      input.slice(0, branch[0].length),
      input.slice(branch[0].length + 1),
    ];

    parsed.revision = rev;
    parsed.path = path ? path : "/";
  } else if (isOid(commitPath[0])) {
    parsed.revision = commitPath[0];
    parsed.path = commitPath[1] ? commitPath[1] : "/";
  } else {
    parsed.path = input;
  }
  return parsed;
}

export class Project implements ProjectInfo {
  id: string;
  head: string;
  name: string;
  description: string;
  defaultBranch: string;
  delegates: string[];
  seed: Seed;
  peers: Peer[];
  branches: Branches;
  patches: {
    open: number;
    draft: number;
    archived: number;
    merged?: number;
  };
  issues: {
    open: number;
    closed: number;
  };

  constructor(
    id: string,
    info: ProjectInfo,
    seed: Seed,
    peers: Peer[],
    branches: Branches,
  ) {
    this.id = id;
    this.head = info.head;
    this.name = info.name;
    this.description = info.description;
    this.defaultBranch = info.defaultBranch;
    this.delegates = info.delegates;
    this.seed = seed;
    this.peers = peers;
    this.branches = branches;
    this.patches = info.patches;
    this.issues = info.issues;
  }

  async getRoot(
    revision: string | null,
  ): Promise<{ tree: Tree; commit: string }> {
    const head = this.branches[this.defaultBranch];
    const commit = revision ? getOid(revision, this.branches) : head;

    if (!commit) {
      throw new Error(`Revision ${revision} not found`);
    }
    const tree = await this.getTree(commit, "/");

    return { tree, commit };
  }

  static async getInfo(nameOrId: string, host: Host): Promise<ProjectInfo> {
    return await new Request(`projects/${nameOrId}`, host).get();
  }

  static async getProjects(
    host: Host,
    opts?: {
      perPage?: number;
      page?: number;
    },
  ): Promise<ProjectInfo[]> {
    const params: Record<string, any> = {
      "per-page": opts?.perPage,
      page: opts?.page,
    };
    return await new Request("projects", host).get(params);
  }

  static async getDelegateProjects(
    delegate: string,
    host: Host,
    opts?: {
      perPage?: number;
      page?: number;
    },
  ): Promise<ProjectInfo[]> {
    const params: Record<string, any> = {
      "per-page": opts?.perPage,
      page: opts?.page,
    };
    return new Request(`delegates/${delegate}/projects`, host).get(params);
  }

  static async getRemote(
    id: string,
    peer: string,
    host: Host,
  ): Promise<Remote> {
    return new Request(`projects/${id}/remotes/${peer}`, host).get();
  }

  static async getRemotes(id: string, host: Host): Promise<Peer[]> {
    return new Request(`projects/${id}/remotes`, host).get();
  }

  static async getCommits(
    id: string,
    host: Host,
    opts?: {
      parent?: string | null;
      since?: string;
      until?: string;
      perPage?: number;
      page?: number;
      verified?: boolean;
    },
  ): Promise<CommitsHistory> {
    const params: Record<string, any> = {
      parent: opts?.parent,
      since: opts?.since,
      until: opts?.until,
      "per-page": opts?.perPage,
      page: opts?.page,
      verified: opts?.verified,
    };
    const result = await new Request(`projects/${id}/commits`, host).get(
      params,
    );
    return result;
  }

  static async getActivity(
    id: string,
    host: Host,
  ): Promise<{ activity: number[] }> {
    return new Request(`projects/${id}/activity`, host).get();
  }

  async getCommit(commit: string): Promise<Commit> {
    const result = await new Request(
      `projects/${this.id}/commits/${commit}`,
      this.seed.addr,
    ).get();

    return result;
  }

  async getTree(commit: string, path: string): Promise<Tree> {
    if (path === "/") path = "";
    const result = await new Request(
      `projects/${this.id}/tree/${commit}/${path}`,
      this.seed.addr,
    ).get();
    return result;
  }

  async getBlob(commit: string, path: string): Promise<Blob> {
    const result = await new Request(
      `projects/${this.id}/blob/${commit}/${path}`,
      this.seed.addr,
    ).get();
    return result;
  }

  async getReadme(commit: string): Promise<Blob> {
    const result = await new Request(
      `projects/${this.id}/readme/${commit}`,
      this.seed.addr,
    ).get();
    return result;
  }

  getRawPath(commit?: string): string {
    return `${this.seed.addr.scheme}://${this.seed.addr.host}:${
      this.seed.addr.port
    }/raw/${this.id}/${commit ?? this.head}`;
  }

  static async get(
    id: string,
    seedHost: string,
    peer?: string,
  ): Promise<Project> {
    let seed: Seed | undefined = undefined;

    try {
      seed = await Seed.lookup(utils.extractHost(seedHost));
    } catch (error) {
      throw new Error(`Couldn't load project: ${error}`);
    }

    const info = await Project.getInfo(id, seed.addr);
    id = isRepositoryId(id) ? id : info.id;

    let peers: Peer[] = [];

    peers = await Project.getRemotes(id, seed.addr);

    let remote: Remote = {
      heads: info.head ? { [info.defaultBranch]: info.head } : {},
    };

    if (peer) {
      try {
        remote = await Project.getRemote(id, peer, seed.addr);
      } catch {
        remote.heads = {};
      }
    }

    return new Project(id, info, seed, peers, remote.heads);
  }

  static async getMulti(
    projs: { nameOrId: string; seed: Host }[],
  ): Promise<ProjectResult[]> {
    const promises = [];

    for (const proj of projs) {
      promises.push(
        Project.getInfo(proj.nameOrId, proj.seed).then(info => {
          return { info, seed: proj.seed };
        }),
      );
    }
    const results = await Promise.allSettled(promises);

    return results.filter(isFulfilled).map(r => r.value);
  }
}
