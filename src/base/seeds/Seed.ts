import type { Config } from "@app/config";

import * as proj from "@app/project";
import { Request, type Host } from "@app/api";
import { assert } from "@app/error";
import { isDomain, isLocal } from "@app/utils";

export interface Stats {
  projects: { count: number };
  users: { count: number };
}

export class Seed {
  public httpApi: Host;
  public git: Host;
  public link: { host: string; id: string; port: number };

  public version?: string;
  public emoji: string;

  public constructor(
    params: {
      host: string;
      id: string;
      git?: string | null;
      api?: string | null;
      version?: string | null;
    },
    cfg: Config,
  ) {
    assert(isDomain(params.host), `invalid seed host: ${params.host}`);
    assert(/^[a-z0-9]+$/.test(params.id), `invalid seed id ${params.id}`);

    let api = null;
    let git = null;
    let httpApiPort: number | null = cfg.seed.httpApi.port;
    let gitPort: number | null = cfg.seed.git.port;

    if (params.api) {
      try {
        const url = new URL(params.api);
        api = url.hostname;
        httpApiPort = url.port ? Number(url.port) : null;
        if (url.protocol === "http:" && url.port === "") {
          httpApiPort = 80;
        }

        if (url.protocol === "https:" && url.port === "") {
          httpApiPort = 443;
        }
      } catch {
        api = params.api;
      }
      assert(isDomain(api), `invalid seed api host ${api}`);
    }

    if (params.git) {
      try {
        const url = new URL(params.git);
        git = url.hostname;
        gitPort = url.port ? Number(url.port) : null;
      } catch {
        git = params.git;
      }
      assert(isDomain(git), `invalid seed git host ${git}`);
    }

    const meta = cfg.seeds.pinned.find(s => s.name === params.host);
    if (meta) {
      this.emoji = meta.emoji;
    } else if (isLocal(params.host)) {
      this.emoji = "🏠";
    } else {
      this.emoji = "🌱";
    }

    // The `git` and `api` keys being more specific take
    // precedence over the `host`, if available.
    api = api ?? params.host;
    git = git ?? params.host;

    this.httpApi = { host: api, port: httpApiPort };
    this.git = { host: git, port: gitPort };
    this.link = { host: params.host, id: params.id, port: cfg.seed.link.port };

    if (params.version) {
      this.version = params.version;
    }
  }

  public get id(): string {
    return this.link.id;
  }

  public get host(): string {
    return this.httpApi.host;
  }

  public async getProjects(
    perPage: number,
    id?: string,
  ): Promise<proj.ProjectInfo[]> {
    const result = id
      ? await proj.Project.getDelegateProjects(id, this.httpApi, { perPage })
      : await proj.Project.getProjects(this.httpApi, { perPage });

    return result.map((project: proj.ProjectInfo) => ({
      ...project,
      id: project.urn,
    }));
  }

  public async getStats(): Promise<{
    projects: { count: number };
    users: { count: number };
  }> {
    return new Request("/stats", this.httpApi).get();
  }

  private static async getPeer(httpApi: Host): Promise<{ id: string }> {
    return new Request("/peer", httpApi).get();
  }

  private static async getInfo(httpApi: Host): Promise<{ version: string }> {
    return new Request("/", httpApi).get();
  }

  public static async lookup(httpApi: Host, cfg: Config): Promise<Seed> {
    const [info, peer] = await Promise.all([
      Seed.getInfo(httpApi),
      Seed.getPeer(httpApi),
    ]);

    return new Seed(
      {
        host: httpApi.host,
        id: peer.id,
        version: info.version,
        api: `https://${httpApi.host}:${httpApi.port}`,
      },
      cfg,
    );
  }
}
