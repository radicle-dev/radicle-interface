import type { Host } from "@app/lib/api";
import type { ProjectInfo } from "@app/lib/project";
import type { Wallet } from "@app/lib/wallet";

import { ethers } from "ethers";

import * as utils from "@app/lib/utils";
import { Profile } from "@app/lib/profile";
import { Project } from "@app/lib/project";
import { config } from "@app/lib/config";

export interface ProjectsAndProfiles {
  projects: { info: ProjectInfo; seed: Host }[];
  profiles: Profile[];
}

type SearchResult =
  | { type: "nothing" }
  | { type: "error"; message: string }
  | { type: "singleProfile"; id: string }
  | { type: "singleProject"; seedHost: string; id: string }
  | { type: "projectsAndProfiles"; projectsAndProfiles: ProjectsAndProfiles };

export async function searchProjectsAndProfiles(
  query: string,
  wallet: Wallet,
): Promise<SearchResult> {
  try {
    // The query is a plain Ethereum address.
    if (ethers.utils.isAddress(query)) {
      return { type: "singleProfile", id: query };
    }

    const projectOnSeeds = config.seeds.pinned.map(seed => ({
      nameOrId: query,
      seed: seed.host,
    }));

    // The query is a radicle project ID.
    if (utils.isRadicleId(query)) {
      const projects = await Project.getMulti(projectOnSeeds);

      if (projects.length === 1) {
        return {
          type: "singleProject",
          seedHost: projects[0].seed.host,
          id: query,
        };
      } else if (projects.length === 0) {
        return { type: "nothing" };
      } else {
        return {
          type: "projectsAndProfiles",
          projectsAndProfiles: { projects, profiles: [] },
        };
      }
    }

    // The query is either a project or a profile name.
    const normalizedQuery = query.toLowerCase();
    const projectsAndProfiles: ProjectsAndProfiles = {
      projects: [],
      profiles: [],
    };

    try {
      const projects = await Project.getMulti(projectOnSeeds);
      projectsAndProfiles.projects.push(...projects);
    } catch {
      // TODO: collect errors and forward to user.
    }

    try {
      let params: string[];
      if (utils.isENSName(normalizedQuery, wallet)) {
        params = [normalizedQuery];
      } else {
        params = [
          `${normalizedQuery}.${wallet.registrar.domain}`,
          `${normalizedQuery}.eth`,
        ];
      }
      const profiles = await Profile.getMulti(params, wallet);
      projectsAndProfiles.profiles.push(...profiles);
    } catch {
      // TODO: collect errors and forward to user.
    }

    const projectCount = projectsAndProfiles.projects.length;
    const profileCount = projectsAndProfiles.profiles.length;

    if (profileCount === 1 && projectCount === 0) {
      return {
        type: "singleProfile",
        id: projectsAndProfiles.profiles[0].address,
      };
    }

    if (profileCount === 0 && projectCount === 1) {
      return {
        type: "singleProject",
        seedHost: projectsAndProfiles.projects[0].seed.host,
        id: query,
      };
    }

    if (profileCount > 0 || projectCount > 0) {
      return {
        type: "projectsAndProfiles",
        projectsAndProfiles,
      };
    }

    return { type: "nothing" };
  } catch (error) {
    let message = "An unknown error occoured while searching.";

    if (error instanceof Error) {
      message = error.message;
    }

    return { type: "error", message };
  }
}
