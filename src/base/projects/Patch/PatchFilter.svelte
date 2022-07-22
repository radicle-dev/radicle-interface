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
    margin: 1rem 0;
    border-radius: 0.25rem;
  }
  .state-toggle {
    cursor: pointer;
    color: var(--color-foreground-80);
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
  }
  .state-toggle:hover {
    cursor: pointer;
    color: var(--color-foreground);
  }
  .state-toggle[disabled], .state-toggle[disabled]:hover {
    cursor: not-allowed;
    color: var(--color-foreground-80);
  }
  .active {
    color: var(--color-foreground);
  }
  .separator {
    color: var(--color-foreground-faded);
    margin: 0 0.5rem;
  }
</style>

<div class="filter">
  <button
    class="unstyled state-toggle"
    on:click={() => state = "proposed"}
    disabled={sortedPatches.proposed.length === 0}
    class:active={state === "proposed"}>
    {sortedPatches.proposed.length} Proposed
  </button>
  <span class="separator">&middot;</span>
  <button
    class="unstyled state-toggle"
    on:click={() => state = "draft"}
    disabled={sortedPatches.draft.length === 0}
    class:active={state === "draft"}>
    {sortedPatches.draft.length} Draft
  </button>
  <span class="separator">&middot;</span>
  <button
    class="unstyled state-toggle"
    on:click={() => state = "archived"}
    disabled={sortedPatches.archived.length === 0}
    class:active={state === "archived"}>
    {sortedPatches.archived.length} Archived
  </button>
</div>

{#if filteredPatches.length}
  <slot {filteredPatches} />
{:else}
  <Placeholder icon="🍖">
    <div slot="title">{capitalize(state)} patches</div>
    <div slot="body">No patches matched the current filter</div>
  </Placeholder>
{/if}
