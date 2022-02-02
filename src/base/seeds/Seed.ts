import * as api from '@app/api';
import type { Config } from '@app/config';
import * as proj from '@app/project';
import type { Project } from "@app/project";
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

  host: string;
  id: string;

  api?: string;
  git?: string;
  version?: string;

  constructor(host: string, id: string, git?: string | null, api?: string | null) {
    assert(isDomain(host), "invalid seed host");
    assert(/^[a-z0-9]+$/.test(id), "invalid seed id");

    this.host = host;
    this.id = id;

    if (api && isDomain(api)) {
      this.api = api;
    }
    if (git && isDomain(git)) {
      this.git = git;
    }
  }

  static async getPeer(config: Config): Promise<{ id: string }> {
    return api.get("/peer", {}, config);
  }

  static async getProject(urn: string, config: Config): Promise<proj.Info> {
    return proj.getInfo(urn, config);
  }

  static async getProjects(config: Config): Promise<Project[]> {
    const result = await proj.getProjects(config);
    return result.map((project: any) => ({ ...project, id: project.urn }));
  }

  static async get(config: Config): Promise<Seed> {
    assert(config.seed.api.host);

    const [info, peer] = await Promise.all([
      api.get("/", {}, config),
      Seed.getPeer(config),
    ]);

    const seed = new Seed(config.seed.api.host, peer.id);
    seed.version = info.version;

    return seed;
  }
}
