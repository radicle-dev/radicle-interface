<script lang="ts">
  import { groupIssues, Issue } from "@app/issue";
  import Placeholder from "@app/Placeholder.svelte";
  import { capitalize } from "@app/utils";

  export let issues: Issue[];
  export let state = "open";

  const { open, closed } = groupIssues(issues);

  $: filteredIssues = state === "open" ? open : closed;
</script>

<style>
  .filter {
    display: flex;
    flex-direction: row;
    margin: 1rem 0;
    border-radius: var(--border-radius-small);
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
    on:click={() => state = "open"}
    disabled={open.length === 0}
    class:active={state === "open"}>
    {open.length} Open
  </button>
  <span class="separator">&middot;</span>
  <button
    class="unstyled state-toggle"
    on:click={() => state = "closed"}
    disabled={closed.length === 0}
    class:active={state === "closed"}>
    {closed.length} Closed
  </button>
</div>

{#if filteredIssues.length}
  <slot {filteredIssues} />
{:else}
  <Placeholder icon="🍣">
    <div slot="title">{capitalize(state)} issues</div>
    <div slot="body">No issues matched the current filter</div>
  </Placeholder>
{/if}
