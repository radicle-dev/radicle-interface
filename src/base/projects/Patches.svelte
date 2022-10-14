<script lang="ts">
  type State = "proposed" | "draft" | "archived";

  import type { Config } from "@app/config";
  import type { Patch } from "@app/patch";
  import type { ToggleButtonOption } from "@app/ToggleButton.svelte";

  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/Placeholder.svelte";
  import ToggleButton from "@app/ToggleButton.svelte";

  import { capitalize } from "@app/utils";
  import { groupPatches } from "@app/patch";
  import { getCurrentRouteParams, navigate } from "@app/router";

  export let state: State = "proposed";
  export let config: Config;
  export let patches: Patch[];

  let options: ToggleButtonOption<State>[];
  const sortedPatches = groupPatches(patches);

  $: filteredPatches = sortedPatches[state];
  $: options = [
    {
      value: "proposed",
      count: sortedPatches.proposed.length,
    },
    {
      value: "draft",
      count: sortedPatches.draft.length,
    },
    {
      value: "archived",
      count: sortedPatches.archived.length,
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
    <ToggleButton
      {options}
      on:select={e => {
        state = e.detail;
      }}
      active={state} />
  </div>

  {#if filteredPatches.length}
    <div class="patches-list">
      {#each filteredPatches as patch}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="teaser"
          on:click={() => {
            navigate({
              type: "projects",
              params: {
                ...getCurrentRouteParams(),
                content: "patch",
                patch: patch.id,
                issue: null,
                revision: null,
                path: null,
              },
            });
          }}>
          <PatchTeaser {config} {patch} />
        </div>
      {/each}
    </div>
  {:else}
    <Placeholder icon="🍖">
      <div slot="title">{capitalize(state)} patches</div>
      <div slot="body">No patches matched the current filter</div>
    </Placeholder>
  {/if}
</div>
