<script lang="ts">
  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import type { Config } from "@app/config";
  import * as proj from "@app/project";
  import Widget from "@app/base/projects/Widget.svelte";
  import type { Profile } from "@app/profile";
  import type { ProjectInfo, Anchor, PendingAnchor } from "@app/project";
  import type { Seed } from "@app/base/seeds/Seed";
  import AnchorActions from "@app/base/profiles/AnchorActions.svelte";
  import List from "@app/List.svelte";

  export let seed: Seed;
  export let profile: Profile | null = null;
  export let account: string | null = null;
  export let projects: proj.ProjectInfo[];
  export let config: Config;

  let anchors: Record<string, Anchor> = {};
  let pendingAnchors: Record<string, PendingAnchor> = {};
  // A pointer to the current page of projects added to the listing
  let page = 0;

  const loadAnchors = async () => {
    if (profile) {
      const [pending, confirmed] = await Promise.all([
        profile.pendingAnchors(config),
        profile.confirmedAnchors(config),
      ]);

      anchors = confirmed;
      pendingAnchors = pending;
    }
  };

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

  onMount(loadAnchors);
</script>

<style>
  .projects {
    margin-top: 1rem;
  }
  .projects .project {
    margin-bottom: 0.5rem;
  }
  .actions {
    display: flex;
    align-items: center;
  }
</style>

<div class="projects">
  <List items={projects} query={fetchMoreProjects}>
    <svelte:fragment slot="list" let:items>
      {#each items as project}
        {@const anchor = anchors[project.urn]}
        {@const pendingAnchor = pendingAnchors[project.urn]}
        {#if project.head}
          <div class="project">
            <Widget {project} {seed} {anchor} on:click={() => onClick(project)}>
              <span class="actions" slot="actions">
                {#if profile?.org?.safe && account && anchor}
                  {#if pendingAnchor}
                    <!-- Pending anchor -->
                    <AnchorActions
                      {account}
                      {config}
                      anchor={pendingAnchor}
                      safe={profile.org.safe}
                      on:success={() => loadAnchors()} />
                  {/if}
                {/if}
              </span>
            </Widget>
          </div>
        {/if}
      {/each}
    </svelte:fragment>
  </List>
</div>
