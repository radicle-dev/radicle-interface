<script lang="ts" context="module">
  export type State = "proposed" | "draft" | "archived";
</script>

<script lang="ts">
  import type { Patch } from "@app/lib/patch";
  import type { Tab } from "@app/components/TabBar.svelte";
  import type { Project } from "@app/lib/project";

  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import TabBar from "@app/components/TabBar.svelte";

  import { capitalize } from "@app/lib/utils";
  import { groupPatches } from "@app/lib/patch";
  import * as router from "@app/lib/router";

  export let state: State;
  export let patches: Patch[];
  export let project: Project;

  let options: Tab<State>[];
  const sortedPatches = groupPatches(patches);

  $: filteredPatches = sortedPatches[state];
  $: options = [
    {
      value: "proposed",
      count: project.patches.proposed,
    },
    {
      value: "draft",
      count: project.patches.draft,
    },
    {
      value: "archived",
      count: project.patches.archived,
    },
  ];
</script>

<style>
  .patches {
    padding: 0 2rem 0 8rem;
    font-size: var(--font-size-small);
  }
  .patches-list {
    border-radius: var(--border-radius-small);
    overflow: hidden;
  }
  .teaser:not(:last-child) {
    border-bottom: 1px dashed var(--color-background);
  }

  @media (max-width: 960px) {
    .patches {
      padding-left: 2rem;
    }
  }
</style>

<div class="patches">
  <div style="margin-bottom: 1rem;">
    <TabBar
      {options}
      on:select={e =>
        router.updateProjectRoute({
          search: `state=${e.detail}`,
        })}
      active={state} />
  </div>

  {#if filteredPatches.length}
    <div class="patches-list">
      {#each filteredPatches as patch}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="teaser"
          on:click={() => {
            router.updateProjectRoute({
              view: { resource: "patch", params: { patch: patch.id } },
            });
          }}>
          <PatchTeaser {patch} />
        </div>
      {/each}
    </div>
  {:else}
    <Placeholder emoji="🍂">
      <div slot="title">{capitalize(state)} patches</div>
      <div slot="body">No patches matched the current filter</div>
    </Placeholder>
  {/if}
</div>
