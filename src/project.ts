import type { Config } from '@app/config';
import * as api from '@app/api';
import type { CommitsHistory } from '@app/base/projects/Commit/lib';
import { isOid } from '@app/utils';
import type { Profile } from '@app/profile';

export type Urn = string;
export type Peer = string;
export type Branch = { [key: string]: string };

export interface ProjectListing {
  name: string;
  urn: Urn;
}
export interface Project {
  id: string;
  anchor: {
    stateHash: string;
  };
}

// Params to render correctly source code related views
export interface Source {
  urn: string;
  org: string;
  user: string;
  peer: string;
  config: Config;
  project: Info;
  peers: Peer[];
  anchors: string[];
  seed: string;
  branches: [string, string][];
  profile?: Profile;
}

export interface PendingProject extends Project {
  safeTxHash: string; // Safe transaction hash.
  confirmations: string[]; // Owner addresses who have confirmed.
}

// Enumerates the space below the Header component in the projects View component
export enum ProjectContent {
  Tree,
  History,
}

export interface Info {
  head: string;
  meta: Meta;
}

export interface Meta {
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

export interface Author {
  avatar: string;
  email: string;
  name: string;
}

export enum ObjectType {
  Blob = "BLOB",
  Tree = "TREE",
}

export interface CommitHeader {
  author: Author;
  committer: Author;
  committerTime: number;
  description: string;
  sha1: string;
  summary: string;
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

export async function getInfo(urn: string, config: Config): Promise<Info> {
  return api.get(`projects/${urn}`, {}, config);
}

export async function getCommits(urn: string, commit: string, config: Config): Promise<CommitsHistory> {
  return api.get(`projects/${urn}/commits/${commit}`, {}, config);
}

export async function getProjects(config: Config): Promise<ProjectListing[]> {
  return api.get("projects", {}, config);
}

export async function getBranchesByPeer(urn: string, peer: string, config: Config): Promise<Branches> {
  return api.get(`projects/${urn}/remotes/${peer}`, {}, config);
}

export async function getPeers(urn: string, config: Config): Promise<Peer[]> {
  return api.get(`projects/${urn}/remotes`, {}, config);
}

export async function getTree(
  urn: string,
  commit: string,
  path: string,
  config: Config
): Promise<Tree> {
  if (path === "/") path = "";
  return api.get(`projects/${urn}/tree/${commit}/${path}`, {}, config);
}

export async function getBlob(
  urn: string,
  commit: string,
  path: string,
  options: { highlight: boolean },
  config: Config
): Promise<Blob> {
  return api.get(`projects/${urn}/blob/${commit}/${path}`, options, config);
}

export async function getReadme(
  urn: string,
  commit: string,
  config: Config
): Promise<Blob> {
  return api.get(`projects/${urn}/readme/${commit}`, {}, config);
}

export function path(
  opts: {
    urn: string;
    org?: string;
    user?: string;
    seed?: string;
    peer?: string;
    content?: ProjectContent;
    revision?: string;
    path?: string;
  }
): string {
  const { urn, org, user, seed, peer, content, revision, path } = opts;
  const result = [];

  if (org) {
    result.push("orgs", org);
  } else if (user) {
    result.push("users", user);
  } else if (seed) {
    result.push("seeds", seed);
  }
  result.push("projects", urn);

  if (peer) {
    result.push("remotes", peer);
  }

  switch (content) {
    case ProjectContent.History:
      result.push("history");
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
