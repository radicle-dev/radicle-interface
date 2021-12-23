import type { Config } from '@app/config';
import * as api from '@app/api';
import type { CommitsHistory } from '@app/base/projects/Commit/lib';

export type Urn = string;

export interface Project {
  id: string;
  anchor: {
    stateHash: string;
  };
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

export async function getInfo(urn: string, config: Config): Promise<Info> {
  return api.get(`projects/${urn}`, {}, config);
}

export async function getCommits(urn: string, commit: string, config: Config): Promise<CommitsHistory> {
  return api.get(`projects/${urn}/commits/${commit}`, {}, config);
}

export async function getProjects(config: Config): Promise<any> {
  return api.get("projects", {}, config);
}

export async function getTree(
  urn: string,
  commit: string,
  path: string,
  config: Config
): Promise<Tree> {
  if (path === "/") {
    path = "";
  }
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
  opts: { urn: string; org?: string; content?: ProjectContent; user?: string; commit?: string; path?: string }
): string {
  const { urn, org, user, content, commit, path } = opts;
  const result = [];

  if (org) {
    result.push("orgs", org);
  } else if (user) {
    result.push("users", user);
  }
  result.push("projects", urn);

  if (content == ProjectContent.History) {
    result.push("history");
  } else {
    result.push("tree");
  }

  if (commit) {
    result.push(commit);
  } else if (path) {
    result.push("head");
  }

  // Avoids appending a slash when the path is the root directory.
  if (path && path !== "/") {
    result.push(path);
  }
  return "/" + result.join("/");
}
