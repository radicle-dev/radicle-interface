import type { Host } from "@app/lib/api";

import * as proj from "@app/lib/project";
import { Request } from "@app/lib/api";
import { assert } from "@app/lib/error";
import { getSeedEmoji } from "@app/lib/utils";
import { isDomain } from "@app/lib/utils";

export interface Stats {
  projects: { count: number };
  users: { count: number };
}

export class InvalidSeed {
  valid = false as const;

  host?: string;
  id?: string;

  constructor(host?: string, id?: string) {
    this.host = host;
    this.id = id;
  }
}

export const defaultSeedPort = 8080;
export const defaultNodePort = 9050;

export class Seed {
  valid = true as const;

  addr: { host: string; port: number | null };
  node: { host: string; id: string; port: number };

  version?: string;
  emoji: string;

  constructor(seed: {
    host: string;
    id: string;
    addr?: string | null;
    version?: string | null;
  }) {
    assert(isDomain(seed.host), `invalid seed host: ${seed.host}`);
    assert(/^[a-zA-Z0-9]+$/.test(seed.id), `invalid seed id ${seed.id}`);

    let _seed = null;
    let _seedPort: number | null = defaultSeedPort;

    if (seed.addr) {
      try {
        const url = new URL(seed.addr);
        _seed = url.hostname;

        if (url.port) {
          _seedPort = Number(url.port);
        } else if (url.protocol === "http:" && url.port === "") {
          _seedPort = 80;
        }
        if (url.protocol === "https:" && url.port === "") {
          _seedPort = 443;
        } else {
          _seedPort = null;
        }
      } catch {
        _seed = seed.addr;
      }
      assert(isDomain(_seed), `invalid seed host ${_seed}`);
    }

    this.emoji = getSeedEmoji(seed.host);

    // The `_seed` being more specific takes
    // precedence over the `host`, if available.
    _seed = _seed ?? seed.host;

    this.addr = { host: _seed, port: _seedPort };
    this.node = { host: seed.host, id: seed.id, port: defaultNodePort };

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

  static async lookup(
    hostname: string,
    port: number = defaultSeedPort,
  ): Promise<Seed> {
    const host = { host: hostname, port };
    const [info, node] = await Promise.all([
      Seed.getInfo(host),
      Seed.getNode(host),
    ]);

    return new Seed({
      host: hostname,
      id: node.id,
      version: info.version,
      addr: `https://${host.host}:${host.port}`,
    });
  }

  static async lookupMulti(hostnames: string[]): Promise<Seed[]> {
    return await Promise.all(hostnames.map(h => Seed.lookup(h)));
  }
}
