import type { Host } from "@app/lib/api";

import * as proj from "@app/lib/project";
import { Request } from "@app/lib/api";
import { assert } from "@app/lib/error";
import { config } from "@app/lib/config";

export interface Stats {
  projects: { count: number };
  users: { count: number };
}

export interface SeedInfo {
  message: "Welcome!";
  service: "radicle-httpd",
  version: string,
  node: {
    id: string;
  };
  path: string;
  links: {
    href: string;
    rel: string;
    type: string;
  }[]
}

export class Seed {
  addr: Host;
  node: Host & { id: string };

  version?: string;

  constructor(seed: { host: Host; id: string; version?: string }) {
    assert(/^[a-zA-Z0-9]+$/.test(seed.id), `invalid seed id ${seed.id}`);

    this.addr = seed.host;
    this.node = {
      host: seed.host.host,
      id: seed.id,
      port: config.seeds.defaultNodePort,
      scheme: seed.host.scheme,
    };

    if (seed.version) {
      this.version = seed.version;
    }
  }

  get id(): string {
    return this.node.id;
  }

  get host(): string {
    return this.addr.host;
  }

  async getProject(id: string): Promise<proj.ProjectInfo> {
    return proj.Project.getInfo(id, this.addr);
  }

  async getProjects(perPage: number, id?: string): Promise<proj.ProjectInfo[]> {
    const result = id
      ? await proj.Project.getDelegateProjects(id, this.addr, { perPage })
      : await proj.Project.getProjects(this.addr, { perPage });

    return result;
  }

  async getStats(): Promise<{
    projects: { count: number };
    users: { count: number };
  }> {
    return new Request("/stats", this.addr).get();
  }

  static async getInfo(host: Host): Promise<SeedInfo> {
    return new Request("/", host).get();
  }

  static async lookup(host: Host): Promise<Seed> {
    const info = await Seed.getInfo(host);

    return new Seed({
      id: info.node.id,
      version: info.version,
      host,
    });
  }
}
