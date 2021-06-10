import type { Config } from '@app/config';

export interface Project {
  id: string;
  anchor: {
    stateHash: string;
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
  if (! config.seed.api) return null;

  const response = await fetch(`${config.seed.api}/v1/projects/${urn}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (! response.ok) {
    return null;
  }

  return await response.json();
}

export async function getTree(
  urn: string,
  commit: string,
  path: string,
  config: Config
): Promise<any | null> {
  if (! config.seed.api) return null;

  const response = await fetch(`${config.seed.api}/v1/projects/${urn}/tree/${commit}/${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
  if (! response.ok) {
    return null;
  }
  return response.json();
}

export async function getBlob(
  urn: string,
  commit: string,
  path: string,
  config: Config
): Promise<Blob | null> {
  if (! config.seed.api) return null;

  const response = await fetch(`${config.seed.api}/v1/projects/${urn}/blob/${commit}/${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
  if (! response.ok) {
    return null;
  }
  return response.json();
}

export async function getReadme(
  urn: string,
  commit: string,
  config: Config
): Promise<Blob | null> {
  if (! config.seed.api) return null;

  const response = await fetch(`${config.seed.api}/v1/projects/${urn}/readme/${commit}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
  if (! response.ok) {
    return null;
  }
  return response.json();
}
