<script lang="ts">
  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import type { Config } from "@app/config";
  import * as proj from "@app/project";
  import Loading from "@app/Loading.svelte";
  import Message from "@app/Message.svelte";
  import Widget from '@app/base/projects/Widget.svelte';
  import type { Profile } from "@app/profile";
  import type { ProjectInfo, Anchor, PendingAnchor } from "@app/project";
  import type { Seed } from "@app/base/seeds/Seed";
  import AnchorActions from "@app/base/profiles/AnchorActions.svelte";

  export let profile: Profile;
  export let config: Config;
  export let seed: Seed;
  export let account: string | null;

  let anchors: Record<string, Anchor> = {};
  let pendingAnchors: Record<string, PendingAnchor> = {};

  const loadAnchors = async () => {
    const [pending, confirmed] = await Promise.all([
      profile.pendingAnchors(config),
      profile.confirmedAnchors(config),
    ]);

    anchors = confirmed;
    pendingAnchors = pending;
  };

  const onClick = (project: ProjectInfo) => {
    navigate(
      proj.path({
        urn: project.urn,
        addressOrName: profile.name ?? profile.address,
        revision: project.head,
      })
    );
  };

  onMount(loadAnchors);
</script>

<style>
  .projects {
    margin-top: 1rem;
  }
  .projects .project {
    margin-bottom: 1rem;
  }
  .actions {
    display: flex;
    align-items: center;
  }
</style>

<div class="projects">
  {#await seed.getProjects()}
    <Loading center />
  {:then projects}
    {#each projects as project}
      {@const anchor = anchors[project.urn]}
      {@const pendingAnchor = pendingAnchors[project.urn]}
      <div class="project">
        <Widget {project} {anchor} on:click={() => onClick(project)}>
          <span class="actions" slot="actions">
            {#if profile.org?.safe && account && anchor}
              {#if pendingAnchor} <!-- Pending anchor -->
                <AnchorActions
                  {account} {config} anchor={pendingAnchor} safe={profile.org.safe}
                  on:success={() => loadAnchors()} />
              {/if}
            {/if}
          </span>
        </Widget>
      </div>
    {/each}
  {:catch err}
    <Message error>
      <strong>Error: </strong> failed to load projects: {err.message}.
    </Message>
  {/await}
</div>
