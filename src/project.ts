import * as api from '@app/api';
import type { Commit, CommitHeader, CommitsHistory } from '@app/commit';
import { isOid } from '@app/utils';
import type { Profile } from '@app/profile';
import type { Seed } from '@app/base/seeds/Seed';

export type Urn = string;
export type Peer = string;
export type Branch = { [key: string]: string };

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

// Params to render correctly source code related views
export interface Source {
  urn: string;
  addressOrName: string;
  peer: string;
  project: ProjectInfo;
  peers: Peer[];
  anchors: string[];
  seed: Seed;
  branches: [string, string][];
  profile?: Profile | null;
}

// Enumerates the space below the Header component in the projects View component
export enum ProjectContent {
  Tree,
  History,
  Commit,
}

export interface ProjectInfo {
  head: string;
  urn: string;
  name: string;
  description: string;
  defaultBranch: string;
  maintainers: Urn[];
  delegates: Peer[];
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

export interface Branches {
  heads: Branch;
}

export async function getInfo(nameOrUrn: string, host: api.Host): Promise<ProjectInfo> {
  const info = await api.get(`projects/${nameOrUrn}`, {}, host);

  return {
    ...info,
    ...info.meta // Nb. This is only needed while we are upgrading to the new http-api.
  };
}

export async function getCommits(urn: string, commit: string, host: api.Host): Promise<CommitsHistory> {
  return api.get(`projects/${urn}/commits?from=${commit}`, {}, host);
}

export async function getCommit(urn: string, commit: string, host: api.Host): Promise<Commit> {
  return api.get(`projects/${urn}/commits/${commit}`, {}, host);
}

export async function getProjects(host: api.Host): Promise<ProjectInfo[]> {
  return api.get("projects", {}, host);
}

export async function getBranchesByPeer(urn: string, peer: string, host: api.Host): Promise<Branches> {
  return api.get(`projects/${urn}/remotes/${peer}`, {}, host);
}

export async function getPeers(urn: string, host: api.Host): Promise<Peer[]> {
  return api.get(`projects/${urn}/remotes`, {}, host);
}

export async function getTree(
  urn: string,
  commit: string,
  path: string,
  host: api.Host
): Promise<Tree> {
  if (path === "/") path = "";
  return api.get(`projects/${urn}/tree/${commit}/${path}`, {}, host);
}

export async function getBlob(
  urn: string,
  commit: string,
  path: string,
  options: { highlight: boolean },
  host: api.Host
): Promise<Blob> {
  return api.get(`projects/${urn}/blob/${commit}/${path}`, options, host);
}

export async function getReadme(
  urn: string,
  commit: string,
  host: api.Host
): Promise<Blob> {
  return api.get(`projects/${urn}/readme/${commit}`, {}, host);
}

export function path(
  opts: {
    urn: string;
    addressOrName?: string;
    seed?: string;
    peer?: string;
    content?: ProjectContent;
    revision?: string;
    path?: string;
  }
): string {
  const { urn, addressOrName, seed, peer, content, revision, path } = opts;
  const result = [];

  if (addressOrName) {
    result.push(addressOrName);
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
      result.push("commit");
      break;

    default:
      result.push("tree");
      break;
  }

  if (revision) {
    result.push(revision);
  } else if (path) {
    result.push("head");
  }

  // Avoids appending a slash when the path is the root directory.
  if (path && path !== "/") {
    result.push(path);
  }
  return "/" + result.join("/");
}

// We need a SHA1 commit in some places, so we return early if the revision is a SHA and else we look into branches.
// As fallback we use the head commit.
export function getOid(head: string, revision: string, branches?: [string, string][]): string {
  if (isOid(revision)) return revision;
  if (branches) {
    const branch = branches.find(([name,]) => name === revision);
    return branch ? branch[1] : head;
  }
  return head;
}

// Splits the path consisting of a revision (eg. branch or commit) and file path into a tuple [revision, file-path]
export function splitPrefixFromPath(input: string, branches: [string, string][], head: string): [string, string] {
  const branch = branches.find(([branchName,]) => input.startsWith(branchName));
  const commitPath = [input.slice(0, 40), input.slice(41)];
  if (branch) {
    const [rev, path] = [input.slice(0, branch[0].length), input.slice(branch[0].length + 1)];
    return [rev, path ? path : "/"];
  } else if (isOid(commitPath[0])) {
    return [commitPath[0], commitPath[1] ? commitPath[1] : "/"];
  }
  return [head, "/"];
}
