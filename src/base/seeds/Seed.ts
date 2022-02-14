import * as api from '@app/api';
import type { Config } from '@app/config';
import * as proj from "@app/project";
import { isDomain } from '@app/utils';
import { assert } from '@app/error';

export class InvalidSeed {
  valid: false = false;

  host?: string;
  id?: string;

  constructor(host?: string, id?: string) {
    this.host = host;
    this.id = id;
  }
}

export class Seed {
  valid: true = true;

  api: { host: string; port: number };
  git: { host: string; port: number };
  link: { host: string; id: string; port: number };

  version?: string;

  constructor(seed: {
    host: string;
    id: string;
    git?: string | null;
    api?: string | null;
    version?: string | null;
  }, cfg: Config) {
    assert(isDomain(seed.host), `invalid seed host: ${seed.host}`);
    assert(/^[a-z0-9]+$/.test(seed.id), `invalid seed id ${seed.id}`);

    seed.api && assert(isDomain(seed.api), `invalid seed api host ${seed.api}`);
    seed.git && assert(isDomain(seed.git), `invalid seed git host ${seed.git}`);

    // The `git` and `api` keys being more specific take
    // precedence over the `host`, if available.
    const api = seed.api ?? seed.host;
    const git = seed.git ?? seed.host;

    this.api = { host: api, port: cfg.seed.api.port };
    this.git = { host: git, port: cfg.seed.git.port };
    this.link = { host: seed.host, id: seed.id, port: cfg.seed.link.port };

    if (seed.version) {
      this.version = seed.version;
    }
  }

  get id(): string {
    return this.link.id;
  }

  get host(): string {
    return this.api.host;
  }

  async getPeer(): Promise<{ id: string }> {
    return Seed.getPeer(this.api);
  }

  async getProject(urn: string): Promise<proj.ProjectInfo> {
    return proj.Project.getInfo(urn, this.api);
  }

  async getProjects(id?: string): Promise<proj.ProjectInfo[]> {
    const result = id
      ? await proj.Project.getDelegateProjects(id, this.api)
      : await proj.Project.getProjects(this.api);

    return result.map((project: proj.ProjectInfo) => ({ ...project, id: project.urn }));
  }

  static async getPeer({ host, port }: api.Host): Promise<{ id: string }> {
    return api.get("/peer", {}, { host, port });
  }

  static async getInfo({ host, port }: api.Host): Promise<{ version: string }> {
    return api.get("/", {}, { host, port });
  }

  static async lookup(hostname: string, cfg: Config): Promise<Seed> {
    const host = { host: hostname, port: cfg.seed.api.port };
    const [info, peer] = await Promise.all([
      Seed.getInfo(host),
      Seed.getPeer(host),
    ]);

    return new Seed({
      host: hostname,
      id: peer.id,
      version: info.version,
    }, cfg);
  }
}
