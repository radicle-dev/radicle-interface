import { navigate } from 'svelte-routing';
import { get, writable } from 'svelte/store';
import * as api from '@app/api';
import type { Commit, CommitHeader, CommitsHistory } from '@app/commit';
import { isOid } from '@app/utils';
import type { Profile } from '@app/profile';
import type { Seed } from '@app/base/seeds/Seed';

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

// Params to render correctly source code related views
export interface Source {
  urn: string;
  project: ProjectInfo;
  peers: PeerId[];
  anchors: string[];
  seed: Seed;
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

export interface Browser {
  content: ProjectContent;
  branches: Branches;
  revision: string | null;
  peer: string | null;
  path: string | null;
}

export const browserStore = writable({
  content: ProjectContent.Tree,
  branches: {},
  revision: null,
  peer: null,
  path: null,
} as Browser);

export interface BrowseTo {
    content?: ProjectContent;
    revision?: string | null;
    path?: string | null;
    peer?: string | null;
    branches?: Branches;
}

export interface PathOptions {
  urn: string;
  content?: ProjectContent;
  profile?: string | null;
  seed?: string | null;
  peer?: string | null;
  revision?: string | null;
  path?: string | null;
}

export function browse(browse: BrowseTo): void {
  const browser = get(browserStore);
  browserStore.set({ ...browser, ...browse });
}

export function pathTo(browse: BrowseTo, source: Source): string {
  const browser = get(browserStore);
  const options: PathOptions = {
    urn: source.urn,
    ...browser,
    ...browse
  };

  if (source.profile) {
    options.profile = source.profile?.nameOrAddress;
  } else {
    options.seed = source.seed.host;
  }

  return path(options);
}

export function navigateTo(browse: BrowseTo, source: Source): void {
  navigate(pathTo(browse, source));
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

export async function getDelegateProjects(delegate: string, host: api.Host): Promise<ProjectInfo[]> {
  return api.get(`delegates/${delegate}/projects`, {}, host);
}

export async function getRemote(urn: string, peer: string, host: api.Host): Promise<Remote> {
  return api.get(`projects/${urn}/remotes/${peer}`, {}, host);
}

export async function getRemotes(urn: string, host: api.Host): Promise<PeerId[]> {
  return api.get(`projects/${urn}/remotes`, {}, host);
}

export async function getRoot(
  project: ProjectInfo,
  revision: string | null,
  peer: string | null,
  host: api.Host
): Promise<{ tree: Tree; branches: Branches; commit: string }> {
  const urn = project.urn;

  let remote: Remote = {
    heads: { [project.defaultBranch]: project.head }
  };

  if (peer) {
    remote = await getRemote(urn, peer, host);
  }

  const head = remote.heads[project.defaultBranch];
  const commit = revision ? getOid(revision, remote.heads) : head;

  if (! commit) {
    throw new Error(`Revision ${revision} not found`);
  }
  const tree = await getTree(urn, commit, "/", host);

  return { tree, branches: remote.heads, commit };
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
// As fallback we use the head commit.
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

// Splits the path consisting of a revision (eg. branch or commit) and file path into a tuple [revision, file-path]
export function splitPrefixFromPath(input: string, branches: Branches): [string, string] | null {
  const branch = Object.entries(branches).find(([branchName,]) => input.startsWith(branchName));
  const commitPath = [input.slice(0, 40), input.slice(41)];

  if (branch) {
    const [rev, path] = [input.slice(0, branch[0].length), input.slice(branch[0].length + 1)];
    return [rev, path ? path : "/"];
  } else if (isOid(commitPath[0])) {
    return [commitPath[0], commitPath[1] ? commitPath[1] : "/"];
  }
  return null;
}
