<script lang="ts">
  import { navigate } from "@app/router";
  import * as proj from "@app/project";
  import Widget from "@app/base/projects/Widget.svelte";
  import type { Profile } from "@app/profile";
  import type { ProjectInfo } from "@app/project";
  import type { Seed, Stats } from "@app/base/seeds/Seed";
  import List from "@app/List.svelte";

  export let seed: Seed | null = null;
  export let profile: Profile | null = null;
  export let projects: proj.ProjectInfo[];
  export let stats: Stats;

  // A pointer to the current page of projects added to the listing
  let page = 0;

  const fetchMoreProjects = async (): Promise<proj.ProjectInfo[]> => {
    try {
      if (profile && profile.seed?.valid) {
        stats = await profile.seed.getStats();
        const projects = await proj.Project.getProjects(profile.seed.api, {
          perPage: 10,
          page: (page += 1),
        });
        if (projects.length > 0) {
          return projects;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // We return an empty array, for when no more projects are found, or an error is thrown
    // since List is looking for an iterable.
    return [];
  };

  const onClick = (project: ProjectInfo) => {
    navigate({
      type: "projects",
      params: {
        urn: project.urn,
        seedHost: seed?.host,
        profileName: profile?.name ?? profile?.address,
        peer: undefined,
        activeView: {
          type: "tree",
          revision: project.defaultBranch,
          path: "/",
        },
      },
    });
  };
</script>

<style>
  .projects {
    margin-top: 1rem;
  }
  .projects .project {
    margin-bottom: 0.5rem;
  }
</style>

<div class="projects">
  <List
    bind:items={projects}
    complete={projects.length === stats.projects.count}
    query={fetchMoreProjects}>
    <svelte:fragment slot="list" let:items>
      {#each items as project}
        {#if project.head}
          <div class="project">
            <Widget
              {project}
              seed={profile?.seed?.valid ? profile.seed : seed}
              on:click={() => onClick(project)} />
          </div>
        {/if}
      {/each}
    </svelte:fragment>
  </List>
</div>
