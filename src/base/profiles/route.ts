import type { Config } from "@app/config";
import { Profile, ProfileType } from "@app/profile";
import type { ProjectInfo } from "@app/project";
import type { Stats } from "@app/base/seeds/Seed";

export type Params = { addressOrName: string };

export interface LoadedRoute {
  type: "profile";
  stats: Stats;
  profile: Profile;
  projects: ProjectInfo[];
}

export async function load(
  params: Params,
  config: Config,
): Promise<LoadedRoute> {
  const profile = await Profile.get(
    params.addressOrName,
    ProfileType.Full,
    config,
  );
  let stats: Stats;
  let projects: ProjectInfo[];
  if (profile.seed?.valid) {
    stats = await profile.seed.getStats();
    projects = await profile.seed.getProjects(10, profile.id);
  } else {
    stats = { projects: { count: 0 }, users: { count: 0 } };
    projects = [];
  }

  return {
    type: "profile",
    profile,
    stats,
    projects,
  };
}
