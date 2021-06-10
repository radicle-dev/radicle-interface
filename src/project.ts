import type { Config } from '@app/config';
import * as api from '@app/api';

export interface Project {
  id: string;
  anchor: {
    stateHash: string;
    stateHashFormat: string;
  };
}

export interface Person {
  urn: string;
  avatar: { emoji: string; background: { r: number; g: number; b: number } };
}

export interface Meta {
  name: string;
  description: string;
  maintainers: Person[];
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

export interface Info {
  name: string;
  objectType: ObjectType;
  lastCommit: CommitHeader;
}

export interface Entry {
  path: string;
  info: Info;
}

export interface Blob {
  binary?: boolean;
  html?: boolean;
  content: string;
  path: string;
  info: Info;
}

export interface Tree {
  entries: Entry[];
  info: Info;
  path: string;
}

export async function getMetadata(urn: string, config: Config): Promise<Meta | null> {
  return api.get(`projects/${urn}`, config);
}

export async function getTree(
  urn: string,
  commit: string,
  path: string,
  config: Config
): Promise<any | null> {
  return api.get(`projects/${urn}/tree/${commit}/${path}`, config);
}

export async function getBlob(
  urn: string,
  commit: string,
  path: string,
  config: Config
): Promise<Blob | null> {
  return api.get(`projects/${urn}/blob/${commit}/${path}`, config);
}

export async function getReadme(
  urn: string,
  commit: string,
  config: Config
): Promise<Blob | null> {
  return api.get(`projects/${urn}/readme/${commit}`, config);
}
