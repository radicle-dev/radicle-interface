import { type Host, Request } from "@app/api";
import type { Commit, CommitHeader, CommitsHistory } from "@app/commit";
import {
  formatLocationHash,
  isFulfilled,
  isOid,
  isRadicleId,
} from "@app/utils";
import { Profile, ProfileType } from "@app/profile";
import { Seed } from "@app/base/seeds/Seed";
import type { Config } from "@app/config";

export type Urn = string;
export type PeerId = string;
export type Branches = { [key: string]: string };

export type Delegate =
  | {
      type: "indirect";
      urn: Urn;
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
  urn: string;
  name: string;
  description: string;
  defaultBranch: string;
  delegates: Delegate[];
  remotes: PeerId[];
  patches?: number;
  issues?: number;
}

export interface Tree {
  path: string;
  info: EntryInfo;
  entries: Array<Entry>;
  stats: Stats;
}

export interface Stats {
  commits: number;
  contributors: number;
}

export enum ObjectType {
  Blob = "BLOB",
  Tree = "TREE",
}

export interface EntryInfo {
  name: string;
  objectType: ObjectType;
  lastCommit: CommitHeader;
}

export interface Entry {
  path: string;
  info: EntryInfo;
}

export interface Blob {
  binary?: boolean;
  html?: boolean;
  content: string;
  path: string;
  info: EntryInfo;
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
): { path: string; revision: string | null; line: number | null } {
  const branch = Object.entries(branches).find(([branchName]) =>
    input.startsWith(branchName),
  );
  const commitPath = [input.slice(0, 40), input.slice(41)];
  const line = input.split("#");
  const parsed: {
    path: string;
    revision: string | null;
    line: number | null;
  } = { path: "/", revision: null, line: null };
  parsed.line = formatLocationHash(line[line.length - 1]);

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
  urn: string;
  head: string | null;
  name: string;
  description: string;
  defaultBranch: string;
  delegates: Delegate[];
  remotes: PeerId[];
  seed: Seed;
  peers: Peer[];
  branches: Branches;
  profile: Profile | null;
  // At the moment we still have seed nodes which won't return neither patches or issues
  patches?: number;
  issues?: number;

  constructor(
    urn: string,
    info: ProjectInfo,
    seed: Seed,
    peers: Peer[],
    branches: Branches,
    profile: Profile | null,
  ) {
    this.urn = urn;
    this.head = info.head;
    this.name = info.name;
    this.description = info.description;
    this.defaultBranch = info.defaultBranch;
    this.delegates = info.delegates;
    this.remotes = info.remotes;
    this.seed = seed;
    this.peers = peers;
    this.branches = branches;
    this.patches = info.patches;
    this.issues = info.issues;
    this.profile = profile;
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

  static async getInfo(nameOrUrn: string, host: Host): Promise<ProjectInfo> {
    return await new Request(`projects/${nameOrUrn}`, host).get();
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
    return new Request("projects", host).get(params);
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
    urn: string,
    peer: string,
    host: Host,
  ): Promise<Remote> {
    return new Request(`projects/${urn}/remotes/${peer}`, host).get();
  }

  static async getRemotes(urn: string, host: Host): Promise<Peer[]> {
    return new Request(`projects/${urn}/remotes`, host).get();
  }

  static async getCommits(
    urn: string,
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
    return new Request(`projects/${urn}/commits`, host).get(params);
  }

  static async getActivity(
    urn: string,
    host: Host,
  ): Promise<{ activity: number[] }> {
    return new Request(`projects/${urn}/activity`, host).get();
  }

  async getCommit(commit: string): Promise<Commit> {
    return new Request(
      `projects/${this.urn}/commits/${commit}`,
      this.seed.api,
    ).get();
  }

  async getTree(commit: string, path: string): Promise<Tree> {
    if (path === "/") path = "";
    return new Request(
      `projects/${this.urn}/tree/${commit}/${path}`,
      this.seed.api,
    ).get();
  }

  async getBlob(
    commit: string,
    path: string,
    options:
      | { highlight: false }
      | { highlight: true; theme: "base16-ocean.dark" | "base16-ocean.light" },
  ): Promise<Blob> {
    return new Request(
      `projects/${this.urn}/blob/${commit}/${path}`,
      this.seed.api,
    ).get(options);
  }

  async getReadme(commit: string): Promise<Blob> {
    return new Request(
      `projects/${this.urn}/readme/${commit}`,
      this.seed.api,
    ).get();
  }

  static async get(
    id: string,
    peer: string | null,
    profileName: string | null,
    seedHost: string | null,
    config: Config,
  ): Promise<Project> {
    const profile = profileName
      ? await Profile.get(profileName, ProfileType.Project, config)
      : null;
    const seed = profile
      ? profile.seed
      : seedHost
      ? await Seed.lookup(seedHost, config)
      : null;

    if (!profile && !seed) {
      throw new Error("Couldn't load project");
    }
    if (!seed?.valid) {
      throw new Error("Couldn't load project: invalid seed");
    }

    const info = await Project.getInfo(id, seed.api);
    const urn = isRadicleId(id) ? id : info.urn;

    // Older versions of http-api don't include the URN.
    if (!info.urn) info.urn = urn;

    const peers: Peer[] = info.delegates
      ? await Project.getRemotes(urn, seed.api)
      : [];

    let remote: Remote = {
      heads: info.head ? { [info.defaultBranch]: info.head } : {},
    };

    if (peer) {
      try {
        remote = await Project.getRemote(urn, peer, seed.api);
      } catch {
        remote.heads = {};
      }
    }

    return new Project(urn, info, seed, peers, remote.heads, profile);
  }

  static async getMulti(
    projs: { nameOrUrn: Urn; seed: string }[],
  ): Promise<{ info: ProjectInfo; seed: Host }[]> {
    const promises = [];

    for (const proj of projs) {
      const seed = { host: proj.seed, port: null };
      promises.push(
        Project.getInfo(proj.nameOrUrn, seed).then(info => {
          return { info, seed };
        }),
      );
    }
    const results = await Promise.allSettled(promises);

    return results.filter(isFulfilled).map(r => r.value);
  }
}
