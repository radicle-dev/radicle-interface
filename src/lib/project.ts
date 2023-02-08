import type { Commit, CommitHeader, CommitsHistory } from "@app/lib/commit";
import type { Host } from "@app/lib/api";
import type { ProjectResult } from "@app/lib/search";

import { Request } from "@app/lib/api";
import { Seed, defaultSeedPort } from "@app/lib/seed";
import { isFulfilled, isOid, isRadicleId } from "@app/lib/utils";

export type Id = string;
export type PeerId = string;
export type Branches = { [key: string]: string };
export type MaybeBlob = Blob | undefined;
export type MaybeTree = Tree | undefined;

// TODO: Remove this after we have migrated to Heartwood.
export type Delegate =
  | {
      type: "indirect";
      id: Id;
      ids: PeerId[];
    }
  | {
      type: "direct";
      id: PeerId;
    };

// Enumerates the space below the Header component in the projects View component
export enum ProjectContent {
  Tree,
  History,
  Commit,
  Issues,
  Issue,
  Patches,
  Patch,
}

export interface ProjectInfo {
  head: string | null;
  id: string;
  name: string;
  description: string;
  defaultBranch: string;
  delegates: string[];
  remotes: PeerId[]; // TODO: Remove this after we have migrated to Heartwood.
  patches: {
    proposed: number;
    draft: number;
    archived: number;
  };
  issues: {
    open: number;
    closed: number;
  };
}

export interface Tree {
  path: string;
  info: EntryInfo; // TODO: Remove this after we have migrated to Heartwood.
  entries: Array<Entry>;
  stats: Stats;
  name: string;
  kind: Kind;
  lastCommit: CommitHeader;
}

// TODO: Remove "TREE" and "BLOB" after we have migrated to Heartwood.
type Kind = "tree" | "blob" | "TREE" | "BLOB";

export interface Stats {
  commits: number;
  contributors: number;
}

// TODO: Remove this after we have migrated to Heartwood.
export interface EntryInfo {
  name: string;
  objectType: Kind;
  lastCommit: CommitHeader;
}

export interface Entry {
  path: string;
  info: EntryInfo; // TODO: Remove this after we have migrated to Heartwood.
  name: string;
  kind: Kind;
  lastCommit: CommitHeader;
}

export interface Blob {
  binary?: boolean;
  html?: boolean;
  content: string;
  path: string;
  info: EntryInfo; // TODO: Remove this after we have migrated to Heartwood.
  name: string;
  kind: Kind;
  lastCommit: CommitHeader;
}

export interface Remote {
  heads: Branches;
}

export interface Person {
  name: string;
}

export interface Peer {
  id: PeerId;
  person?: Person;
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
  head: string | null;
  name: string;
  description: string;
  defaultBranch: string;
  delegates: string[];
  remotes: PeerId[]; // TODO: Remove this after we have migrated to Heartwood.
  seed: Seed;
  peers: Peer[];
  branches: Branches;
  patches: {
    proposed: number;
    draft: number;
    archived: number;
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
    this.remotes = info.remotes; // TODO: Remove this after we have migrated to Heartwood.
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
    if (window.HEARTWOOD) {
      return await new Request(`projects/${nameOrId}`, host).get();
    } else {
      const result = await new Request(`projects/${nameOrId}`, host).get();
      result["id"] = result["urn"];
      delete result["urn"];
      return result;
    }
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
    if (window.HEARTWOOD) {
      return await new Request("projects", host).get(params);
    } else {
      const results = await new Request("projects", host).get(params);
      results.forEach((result: { [x: string]: any }) => {
        result["id"] = result["urn"];
        delete result["urn"];
      });

      return results;
    }
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
    if (!window.HEARTWOOD) {
      for (const commit of result.headers) {
        commit.commit = commit.header;
        delete commit.header;

        commit.commit.committer.time = commit.commit.committerTime;
        delete commit.commit.committerTime;

        commit.commit.id = commit.commit.sha1;
        delete commit.commit.sha1;
      }
      result.commits = result.headers;
      delete result.headers;
    }
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

    if (!window.HEARTWOOD) {
      result.commit = result.header;
      delete result.header;

      result.commit.committer.time = result.commit.committerTime;
      delete result.commit.committerTime;

      result.commit.id = result.commit.sha1;
      delete result.commit.sha1;

      result.stats["insertions"] = result.stats["additions"];
      delete result.stats["additions"];
      result.diff["added"] = result.diff["created"];
      delete result.diff["created"];

      for (const kind of ["added", "deleted", "modified"]) {
        for (const file of result.diff[kind]) {
          for (const hunk of file.diff.hunks) {
            for (const line of hunk.lines) {
              if (line["lineNumOld"]) {
                line["lineNoOld"] = line["lineNumOld"];
                delete line["lineNumOld"];
              }

              if (line["lineNumNew"]) {
                line["lineNoNew"] = line["lineNumNew"];
                delete line["lineNumNew"];
              }

              if (line["lineNum"]) {
                line["lineNo"] = line["lineNum"];
                delete line["lineNum"];
              }
            }
          }
        }
      }
    }

    return result;
  }

  async getTree(commit: string, path: string): Promise<Tree> {
    if (path === "/") path = "";
    const result = await new Request(
      `projects/${this.id}/tree/${commit}/${path}`,
      this.seed.addr,
    ).get();
    if (!window.HEARTWOOD) {
      if (result.info.lastCommit) {
        result.info.lastCommit.id = result.info.lastCommit.sha1;
        delete result.info.lastCommit.sha1;
      }
      for (const entry of result.entries) {
        if (entry.info.lastCommit) {
          entry.info.lastCommit.id = entry.info.lastCommit.sha1;
        }
      }
    }
    return result;
  }

  async getBlob(commit: string, path: string): Promise<Blob> {
    const result = await new Request(
      `projects/${this.id}/blob/${commit}/${path}`,
      this.seed.addr,
    ).get();
    if (!window.HEARTWOOD) {
      result.info.lastCommit.id = result.info.lastCommit.sha1;
      delete result.info.lastCommit.sha1;
    }
    return result;
  }

  async getReadme(commit: string): Promise<Blob> {
    const result = await new Request(
      `projects/${this.id}/readme/${commit}`,
      this.seed.addr,
    ).get();
    if (!window.HEARTWOOD && result.info.lastCommit) {
      result.info.lastCommit.id = result.info.lastCommit.sha1;
      delete result.info.lastCommit.sha1;
    }
    return result;
  }

  static async get(
    id: string,
    seedHost: string,
    peer?: string,
  ): Promise<Project> {
    const [host, port] = seedHost.includes(":")
      ? seedHost.split(":")
      : [seedHost, defaultSeedPort];

    const seed = await Seed.lookup(host, Number(port)).catch(() => {
      throw new Error("Couldn't load project");
    });

    if (!seed?.valid) {
      throw new Error("Couldn't load project: invalid seed");
    }

    const info = await Project.getInfo(id, seed.addr);
    id = isRadicleId(id) ? id : info.id;

    let peers: Peer[] = [];

    if (window.HEARTWOOD) {
      peers = await Project.getRemotes(id, seed.addr);
    } else {
      // Older versions of http-api don't include the ID.
      if (!info.id) info.id = id;

      peers = info.delegates ? await Project.getRemotes(id, seed.addr) : [];
    }

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
    projs: { nameOrId: Id; seed: string }[],
  ): Promise<ProjectResult[]> {
    const promises = [];

    for (const proj of projs) {
      const seed = { host: proj.seed, port: null };
      promises.push(
        Project.getInfo(proj.nameOrId, seed).then(info => {
          return { info, seed };
        }),
      );
    }
    const results = await Promise.allSettled(promises);

    return results.filter(isFulfilled).map(r => r.value);
  }
}
