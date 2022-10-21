<script lang="ts" context="module">
  import type { Host } from "@app/api";
  import type { ProjectInfo } from "@app/project";

  import { ethers } from "ethers";

  import * as utils from "@app/utils";
  import { Profile } from "@app/profile";
  import { Project } from "@app/project";
  import config from "@app/config.json";

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

  async function searchProjectsAndProfiles(
    query: string,
    wallet: Wallet,
  ): Promise<SearchResult> {
    try {
      // The query is a plain Ethereum address.
      if (ethers.utils.isAddress(query)) {
        return { type: "singleProfile", id: query };
      }

      const projectOnSeeds = config.seeds.pinned.map(seed => ({
        nameOrUrn: query,
        seed: seed.host,
      }));

      // The query is a radicle project URN.
      if (utils.isRadicleId(query)) {
        const projects = await Project.getMulti(projectOnSeeds);

        if (projects.length === 1) {
          return {
            type: "singleProject",
            seedHost: projects[0].seed.host,
            id: query,
          };
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
</script>

<script lang="ts" strictEvents>
  import type { Wallet } from "@app/wallet";

  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";
  import * as router from "@app/router";

  import TextInput from "@app/TextInput.svelte";
  import { unreachable } from "@app/utils";

  export let wallet: Wallet;

  const dispatch = createEventDispatcher<{
    finished: boolean;
    search: { query: string; results: ProjectsAndProfiles };
  }>();

  let input = "";
  let loading = false;
  let shaking = false;

  function shake() {
    shaking = true;
    debounce(() => (shaking = false), 500)();
  }

  async function search() {
    if (!valid) {
      return;
    }

    loading = true;

    const query = input;
    const searchResult = await searchProjectsAndProfiles(input, wallet);

    if (searchResult.type === "nothing") {
      shake();
    } else if (searchResult.type === "error") {
      // TODO: show some kind of notification to the user.
      shake();
    } else if (searchResult.type === "singleProfile") {
      input = "";
      router.replace({
        resource: "profile",
        params: { addressOrName: searchResult.id },
      });
      dispatch("finished");
    } else if (searchResult.type === "singleProject") {
      input = "";
      router.replace({
        resource: "projects",
        params: {
          view: { resource: "tree" },
          urn: searchResult.id,
          peer: undefined,
          profile: undefined,
          seed: searchResult.seedHost,
          hash: undefined,
          search: undefined,
        },
      });
      dispatch("finished");
    } else if (searchResult.type === "projectsAndProfiles") {
      // TODO: show some kind of notification about any errors to the user.
      input = "";
      dispatch("search", {
        query,
        results: searchResult.projectsAndProfiles,
      });
      dispatch("finished");
    } else {
      unreachable(searchResult);
    }
    loading = false;
  }

  $: valid = input !== "";
</script>

<style>
  .search {
    display: flex;
  }
  .shaking {
    animation: horizontal-shaking 0.35s;
  }
  @keyframes horizontal-shaking {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(5px);
    }
    50% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
    100% {
      transform: translateX(0);
    }
  }
</style>

<div class="search" class:shaking>
  <TextInput
    variant="dashed"
    valid={input !== ""}
    {loading}
    disabled={loading}
    bind:value={input}
    on:submit={search}
    placeholder="Search a name or address…" />
</div>
