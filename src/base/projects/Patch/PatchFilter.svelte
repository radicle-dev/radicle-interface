<script lang="ts">
  import { groupPatches, Patch } from "@app/patch";
  import Placeholder from "@app/Placeholder.svelte";
  import { capitalize } from "@app/utils";

  export let patches: Patch[];
  export let state = "proposed";

  const sortedPatches = groupPatches(patches);

  $: filteredPatches = sortedPatches[state];
</script>

<style>
  .filter {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin: 1rem 0;
  }
  .state-toggle {
    cursor: pointer;
    color: var(--color-foreground-80);
    border-radius: var(--border-radius-small);
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  .state-toggle:hover:not([disabled]), .state-toggle.active {
    cursor: pointer;
    color: var(--color-foreground);
    background-color: var(--color-foreground-background);
  }
  .state-toggle[disabled], .state-toggle[disabled]:hover {
    cursor: not-allowed;
    color: var(--color-foreground-80);
  }
  .active {
    color: var(--color-foreground);
  }
</style>

<div class="filter">
  <div
    class="unstyled state-toggle"
    on:click={() => state = "proposed"}
    disabled={sortedPatches.proposed.length === 0}
    class:active={state === "proposed"}>
    {sortedPatches.proposed.length} Proposed
  </div>
  <div
    class="unstyled state-toggle"
    on:click={() => state = "draft"}
    disabled={sortedPatches.draft.length === 0}
    class:active={state === "draft"}>
    {sortedPatches.draft.length} Draft
  </div>
  <div
    class="unstyled state-toggle"
    on:click={() => state = "archived"}
    disabled={sortedPatches.archived.length === 0}
    class:active={state === "archived"}>
    {sortedPatches.archived.length} Archived
  </div>
</div>

{#if filteredPatches.length}
  <slot {filteredPatches} />
{:else}
  <Placeholder icon="🍖">
    <div slot="title">{capitalize(state)} patches</div>
    <div slot="body">No patches matched the current filter</div>
  </Placeholder>
{/if}
