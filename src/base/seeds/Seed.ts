import * as api from '@app/api';
import type { Config } from '@app/config';
import { getInfo, getProjects } from '@app/project';
import type { Info, Project } from "@app/project";
import { isDomain } from '@app/utils';

export interface SeedInfo {
  version: string;
}

export class Seed {
  host?: string;
  id?: string;
  git?: string;
  api?: string;
  config: Config;

  constructor(config: Config, host?: string, id?: string, git?: string, api?: string) {
    if (id && /^[a-z0-9]+$/.test(id)) {
      this.id = id;
    }
    if (host && isDomain(host)) {
      this.host = host;
    }
    if (api && isDomain(api)) {
      this.api = api;
    }
    if (git && isDomain(git)) {
      this.git = git;
    }
    this.config = config.withSeed(this);
  }
  async getInfo(): Promise<SeedInfo> {
    return api.get(``, {}, this.config);
  }
  async getPeer(): Promise<{ id: string }> {
    return api.get("peer", {}, this.config);
  }
  async getProject(urn: string): Promise<Info> {
    return getInfo(urn, this.config);
  }
  async getProjects(): Promise<Project[]> {
    const result = await getProjects(this.config);
    return result.map((project: any) => ({ ...project, id: project.urn }));
  }
}
