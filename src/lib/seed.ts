import type { Host } from "@app/lib/api";

import * as proj from "@app/lib/project";
import { Request } from "@app/lib/api";
import { assert } from "@app/lib/error";
import { getSeedEmoji } from "@app/lib/utils";
import { config } from "@app/lib/config";

export interface Stats {
  projects: { count: number };
  users: { count: number };
}

export class Seed {
  addr: Host;
  node: Host & { id: string };

  version?: string;
  emoji: string;

  constructor(seed: { host: Host; id: string; version?: string }) {
    assert(/^[a-zA-Z0-9]+$/.test(seed.id), `invalid seed id ${seed.id}`);

    this.emoji = getSeedEmoji(seed.host.host);

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

  async getNode(): Promise<{ id: string }> {
    return Seed.getNode(this.addr);
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

  static async getNode(host: Host): Promise<{ id: string }> {
    return new Request("/node", host).get();
  }

  static async getInfo(host: Host): Promise<{ version: string }> {
    return new Request("/", host).get();
  }

  static async lookup(host: Host): Promise<Seed> {
    const [info, node] = await Promise.all([
      Seed.getInfo(host),
      Seed.getNode(host),
    ]);

    return new Seed({
      id: node.id,
      version: info.version,
      host,
    });
  }
}
