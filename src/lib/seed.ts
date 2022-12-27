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

export const defaultSeedPort = window.HEARTWOOD ? 8080 : 8777;
export const defaultNodePort = 8776;
// TODO: Remove this after we have migrated to Heartwood.
export const defaultGitPort = 443;

export class Seed {
  valid = true as const;

  addr: { host: string; port: number | null };
  git: { host: string; port: number | null }; // TODO: Remove this after we have migrated to Heartwood.
  node: { host: string; id: string; port: number };

  version?: string;
  emoji: string;

  constructor(seed: {
    host: string;
    id: string;
    git?: string | null; // TODO: Remove this after we have migrated to Heartwood.
    addr?: string | null;
    version?: string | null;
  }) {
    assert(isDomain(seed.host), `invalid seed host: ${seed.host}`);
    if (window.HEARTWOOD) {
      assert(/^[a-zA-Z0-9]+$/.test(seed.id), `invalid seed id ${seed.id}`);
    } else {
      assert(/^[a-z0-9]+$/.test(seed.id), `invalid seed id ${seed.id}`);
    }

    let _seed = null;
    let _git = null; // TODO: Remove this after we have migrated to Heartwood.
    let _seedPort: number | null = defaultSeedPort;
    let _gitPort: number | null = defaultGitPort; // TODO: Remove this after we have migrated to Heartwood.

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

    if (window.HEARTWOOD) {
      if (seed.git) {
        try {
          const url = new URL(seed.git);
          _git = url.hostname;
          _gitPort = url.port ? Number(url.port) : null;
        } catch {
          _git = seed.git;
        }
        assert(isDomain(_git), `invalid seed git host ${_git}`);
      }
    }

    this.emoji = getSeedEmoji(seed.host);

    // The `_seed` being more specific takes
    // precedence over the `host`, if available.
    _seed = _seed ?? seed.host;
    _git = _git ?? seed.host; // TODO: Remove this after we have migrated to Heartwood.

    this.addr = { host: _seed, port: _seedPort };
    this.git = { host: _git, port: _gitPort }; // TODO: Remove this after we have migrated to Heartwood.
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

    if (window.HEARTWOOD) {
      return result;
    } else {
      return result.map((project: proj.ProjectInfo) => ({
        ...project,
        id: project.id,
      }));
    }
  }

  async getStats(): Promise<{
    projects: { count: number };
    users: { count: number };
  }> {
    return new Request("/stats", this.addr).get();
  }

  static async getNode(host: Host): Promise<{ id: string }> {
    if (window.HEARTWOOD) {
      return new Request("/node", host).get();
    } else {
      return new Request("/peer", host).get();
    }
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
