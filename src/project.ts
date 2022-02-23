import { navigate } from 'svelte-routing';
import { get, writable } from 'svelte/store';
import * as api from '@app/api';
import type { Commit, CommitHeader, CommitsHistory } from '@app/commit';
import { isOid, isRadicleId } from '@app/utils';
import { Profile, ProfileType } from '@app/profile';
import { Seed } from '@app/base/seeds/Seed';
import type { Config } from '@app/config';

export type Urn = string;
export type PeerId = string;
export type Branches = { [key: string]: string };

export interface Anchor {
  confirmed: true;
  id: string;
  anchor: {
    stateHash: string;
  };
}

export interface PendingAnchor {
  confirmed: false;
  id: string;
  safeTxHash: string; // Safe transaction hash.
  confirmations: string[]; // Owner addresses who have confirmed.
  anchor: {
    stateHash: string;
  };
}

// Enumerates the space below the Header component in the projects View component
export enum ProjectContent {
  Tree,
  History,
  Commit,
}

export interface ProjectInfo {
  head: string | null;
  urn: string;
  name: string;
  description: string;
  defaultBranch: string;
  maintainers: Urn[];
  delegates: PeerId[];
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

export interface Browser {
  content: ProjectContent;
  revision: string | null;
  peer: string | null;
  path: string | null;
  line: number | null;
}

export const browserStore = writable({
  content: ProjectContent.Tree,
  branches: {},
  revision: null,
  peer: null,
  path: null,
  line: null,
} as Browser);

export interface BrowseTo {
  content?: ProjectContent;
  revision?: string | null;
  path?: string | null;
  peer?: string | null;
  line?: number | null;
}

export interface PathOptions extends BrowseTo {
  urn: string;
  profile?: string | null;
  seed?: string | null;
}

export function browse(browse: BrowseTo): void {
  const browser = get(browserStore);
  browserStore.set({ ...browser, ...browse });
}

export function path(opts: PathOptions): string {
  const { urn, profile, seed, peer, content, revision, path } = opts;
  const result = [];

  if (profile) {
    result.push(profile);
  } else if (seed) {
    result.push("seeds", seed);
  }
  result.push(urn);

  if (peer) {
    result.push("remotes", peer);
  }

  switch (content) {
    case ProjectContent.History:
      result.push("history");
      break;

    case ProjectContent.Commit:
      result.push("commits");
      break;

    default:
      result.push("tree");
      break;
  }

  if (revision) {
    result.push(revision);
  }

  // Avoids appending a slash when the path is the root directory.
  if (path && path !== "/") {
    result.push(path);
  }
  return "/" + result.join("/");
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
export function parseRoute(input: string, branches: Branches): { path?: string; revision?: string } {
  const branch = Object.entries(branches).find(([branchName,]) => input.startsWith(branchName));
  const commitPath = [input.slice(0, 40), input.slice(41)];
  const parsed: { path?: string; revision?: string } = {};

  if (branch) {
    const [rev, path] = [input.slice(0, branch[0].length), input.slice(branch[0].length + 1)];

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
  maintainers: Urn[];
  delegates: PeerId[];
  seed: Seed;
  peers: Peer[];
  branches: Branches;
  profile: Profile | null;
  anchors: string[];

  constructor(urn: string, info: ProjectInfo, seed: Seed, peers: Peer[], branches: Branches, profile: Profile | null, anchors: string[]) {
    this.urn = urn;
    this.head = info.head;
    this.name = info.name;
    this.description = info.description;
    this.defaultBranch = info.defaultBranch;
    this.maintainers = info.maintainers;
    this.delegates = info.delegates;
    this.seed = seed;
    this.peers = peers;
    this.branches = branches;
    this.profile = profile;
    this.anchors = anchors;
  }

  async getRoot(
    revision: string | null,
  ): Promise<{ tree: Tree; commit: string }> {
    const head = this.branches[this.defaultBranch];
    const commit = revision ? getOid(revision, this.branches) : head;

    if (! commit) {
      throw new Error(`Revision ${revision} not found`);
    }
    const tree = await this.getTree(commit, "/");

    return { tree, commit };
  }

  static async getInfo(nameOrUrn: string, host: api.Host): Promise<ProjectInfo> {
    const info = await api.get(`projects/${nameOrUrn}`, {}, host);

    return {
      ...info,
      ...info.meta // Nb. This is only needed while we are upgrading to the new http-api.
    };
  }

  static async getProjects(host: api.Host): Promise<ProjectInfo[]> {
    return api.get("projects", {}, host);
  }

  static async getDelegateProjects(delegate: string, host: api.Host): Promise<ProjectInfo[]> {
    return api.get(`delegates/${delegate}/projects`, {}, host);
  }

  static async getRemote(urn: string, peer: string, host: api.Host): Promise<Remote> {
    return api.get(`projects/${urn}/remotes/${peer}`, {}, host);
  }

  static async getRemotes(urn: string, host: api.Host): Promise<Peer[]> {
    return api.get(`projects/${urn}/remotes`, {}, host);
  }

  static async getCommits(urn: string, host: api.Host, parent?: string, since?: string, until?: string, perPage?: string, page?: string): Promise<CommitsHistory> {
    const params: Record<string, string | undefined> = { parent, since, until, "per-page": perPage, page };
    // Removes the undefined params.
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return api.get(`projects/${urn}/commits`, params, host);
  }

  async getCommit(commit: string): Promise<Commit> {
    return api.get(`projects/${this.urn}/commits/${commit}`, {}, this.seed.api);
  }

  async getTree(
    commit: string,
    path: string,
  ): Promise<Tree> {
    if (path === "/") path = "";
    return api.get(`projects/${this.urn}/tree/${commit}/${path}`, {}, this.seed.api);
  }

  async getBlob(
    commit: string,
    path: string,
    options: { highlight: boolean },
  ): Promise<Blob> {
    return api.get(`projects/${this.urn}/blob/${commit}/${path}`, options, this.seed.api);
  }

  async getReadme(
    commit: string,
  ): Promise<Blob> {
    return api.get(`projects/${this.urn}/readme/${commit}`, {}, this.seed.api);
  }

  navigateTo(browse: BrowseTo): void {
    navigate(this.pathTo(browse));
  }

  pathTo(browse: BrowseTo): string {
    const browser = get(browserStore);
    const options: PathOptions = {
      urn: this.urn,
      ...browser,
      ...browse
    };

    if (this.profile) {
      options.profile = this.profile?.nameOrAddress;
    } else {
      options.seed = this.seed.host;
    }

    return path(options);
  }

  static async get(id: string, peer: string | null, profileName: string | null, seedHost: string | null, config: Config): Promise<Project> {
    const profile = profileName ? await Profile.get(profileName, ProfileType.Project, config) : null;
    const seed = profile ? profile.seed : seedHost ? await Seed.lookup(seedHost, config) : null;

    if (!profile && !seed) {
      throw new Error("Couldn't load project");
    }
    if (! seed?.valid) {
      throw new Error("Couldn't load project: invalid seed");
    }

    const info = await Project.getInfo(id, seed.api);
    const urn = isRadicleId(id) ? id : info.urn;
    const anchors = profile ? await profile.confirmedProjectAnchors(urn, config) : [];

    // Older versions of http-api don't include the URN.
    if (! info.urn) info.urn = urn;

    const peers: Peer[] = info.delegates
      ? await Project.getRemotes(urn, seed.api)
      : [];

    let remote: Remote = {
      heads: info.head ? { [info.defaultBranch]: info.head } : {}
    };

    if (peer) {
      try {
        remote = await Project.getRemote(urn, peer, seed.api);
      } catch {
        remote.heads = {};
      }
    }

    return new Project(urn, info, seed, peers, remote.heads, profile, anchors);
  }
}
