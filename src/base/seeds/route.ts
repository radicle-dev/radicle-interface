import type { Config } from "@app/config";
import { Project, type ProjectInfo } from "@app/project";
import { Seed, type Stats } from "./Seed";

export type Params = { host: string };

export interface LoadedRoute {
  type: "seeds";
  seed: Seed;
  stats: Stats;
  projects: ProjectInfo[];
}

export async function load(
  params: Params,
  config: Config,
): Promise<LoadedRoute> {
  const seed = await Seed.lookup(params.host, config);
  const projects = await Project.getProjects(
    { host: params.host, port: null },
    { perPage: 10 },
  );
  const stats = await seed.getStats();
  return { type: "seeds", projects, seed, stats };
}
