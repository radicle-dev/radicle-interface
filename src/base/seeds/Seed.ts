import * as api from '@app/api';
import type { Config } from '@app/config';
import * as proj from '@app/project';
import type { Project } from "@app/project";
import { isDomain } from '@app/utils';
import { assert } from '@app/error';

export class Seed {
  host: string;
  id: string;

  api?: string;
  git?: string;
  version?: string;

  constructor(host: string, id: string, git?: string, api?: string) {
    assert(isDomain(host));
    assert(/^[a-z0-9]+$/.test(id));

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

    return {
      host: config.seed.api.host,
      id: peer.id,
      version: info.version,
    };
  }
}
