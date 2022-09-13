import { Project } from "@app/project";
import type { ProjectInfo } from "@app/project";
import * as utils from "@app/utils";
import { ethers } from "ethers";
import type { Config } from "@app/config";
import { navigate } from "svelte-routing";
import type { Host } from "@app/api";
import { Profile, ProfileType } from "@app/profile";

export interface IProject {
  info: ProjectInfo;
  seed: Host;
}

export interface ResolvedSearch {
  projects: IProject[];
  ens: Profile[];
}

export async function resolve(
  q: string | null,
  config: Config,
): Promise<ResolvedSearch | null> {
  const results: ResolvedSearch = {
    projects: [],
    ens: [],
  };

  try {
    if (q) {
      const seeds = Object.keys(config.seeds.pinned).map(seed => ({
        urn: q as string,
        seed,
      }));

      if (ethers.utils.isAddress(q)) {
        navigate(`/${q}`, { replace: true });
        return null;

        // ========= Projects =========
      } else if (utils.isRadicleId(q)) {
        const projects = await Project.getMulti(seeds);
        if (projects.length === 1) {
          navigate(`/seeds/${projects[0].seed.host}/${q}`, {
            replace: true,
          });
          return null;
        } else {
          results.projects.push(...projects);
        }
      } else {
        const projects = await Project.getMulti(seeds);
        results.projects.push(...projects);

        // ========= ENS Names =========
        let profile: Profile | null;
        try {
          profile = await Profile.get(q, ProfileType.Minimal, config);
        } catch (e) {
          profile = null;
        }

        if (profile) {
          if (results.projects.length === 0) {
            navigate(`/${profile.address}`, { replace: true });
            return null;
          } else {
            results.ens.push(profile);
          }
        } else {
          let profiles: Profile[];
          try {
            profiles = await Profile.getMulti(
              [`${q}.${config.registrar.domain}`, `${q}.eth`],
              config,
            );
          } catch (e) {
            profiles = [];
          }

          if (profiles.length > 1) {
            results.ens.push(...profiles);
          } else if (profiles.length === 1) {
            if (results.projects.length === 0) {
              navigate(`/${profiles[0].address}`, { replace: true });
              return null;
            } else {
              results.ens.push(...profiles);
            }
          } else {
            if (results.projects.length === 1) {
              navigate(`/seeds/${projects[0].seed.host}/${q}`, {
                replace: true,
              });
              return null;
            }
          }
        }
      }
    }

    if (results.projects.length > 0 || results.ens.length > 0) {
      return results;
    }

    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}
