<script lang="ts">
  import type { Profile } from "@app/lib/profile";
  import type { Route } from "@app/lib/router/definitions";
  import type { Seed, Stats } from "@app/lib/seed";

  import * as proj from "@app/lib/project";
  import List from "@app/components/List.svelte";
  import Widget from "@app/views/projects/Widget.svelte";
  import Link from "@app/components/Link.svelte";

  export let seed: Seed;
  export let profile: Profile | null = null;
  export let projects: proj.ProjectInfo[];
  export let stats: Stats;

  // A pointer to the current page of projects added to the listing
  let page = 0;

  const fetchMoreProjects = async (): Promise<proj.ProjectInfo[]> => {
    try {
      stats = await seed.getStats();
      const projects = await proj.Project.getProjects(seed.addr, {
        perPage: 10,
        page: (page += 1),
      });
      if (projects.length > 0) {
        return projects;
      }
    } catch (e) {
      console.error(e);
    }

    // We return an empty array, for when no more projects are found, or an error is thrown
    // since List is looking for an iterable.
    return [];
  };

  const widgetRoute = (project: proj.ProjectInfo): Route => ({
    resource: "projects",
    params: {
      view: { resource: "tree" },
      id: project.id,
      seed: seed.addr.port
        ? `${seed.addr.host}:${seed.addr.port}`
        : seed.addr.host,
      profile: profile?.name ?? profile?.address,
      revision: project.head ?? undefined,
      hash: undefined,
      search: undefined,
    },
  });
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
            <Link route={widgetRoute(project)}>
              <Widget {project} {seed} />
            </Link>
          </div>
        {/if}
      {/each}
    </svelte:fragment>
  </List>
</div>
