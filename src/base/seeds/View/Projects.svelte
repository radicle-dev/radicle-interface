<script lang="ts">
  import { navigate } from "svelte-routing";
  import * as proj from "@app/project";
  import Widget from "@app/base/projects/Widget.svelte";
  import type { Profile } from "@app/profile";
  import type { ProjectInfo } from "@app/project";
  import type { Seed } from "@app/base/seeds/Seed";
  import List from "@app/List.svelte";

  export let seed: Seed;
  export let profile: Profile | null = null;
  export let projects: proj.ProjectInfo[];

  // A pointer to the current page of projects added to the listing
  let page = 0;

  const fetchMoreProjects = async (): Promise<proj.ProjectInfo[]> => {
    const projects = await proj.Project.getProjects(seed.api, {
      perPage: 10,
      page: (page += 1),
    });
    if (projects.length > 0) {
      return projects;
    }

    // We return an empty array, for when no more projects are found, since List is looking for an iterable.
    return [];
  };

  const onClick = (project: ProjectInfo) => {
    navigate(
      proj.path({
        urn: project.urn,
        seed: seed?.host,
        profile: profile?.name ?? profile?.address,
        revision: project.head,
      }),
    );
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
  <List items={projects} query={fetchMoreProjects}>
    <svelte:fragment slot="list" let:items>
      {#each items as project}
        {#if project.head}
          <div class="project">
            <Widget {project} {seed} on:click={() => onClick(project)} />
          </div>
        {/if}
      {/each}
    </svelte:fragment>
  </List>
</div>
