<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CommitStats } from "@app/commit";
  import type { Diff } from "@app/diff";
  import Icon from "@app/Icon.svelte";
  import FileDiff from "@app/base/projects/SourceBrowser/FileDiff.svelte";

  const dispatch = createEventDispatcher();

  export let diff: Diff;
  export let stats: CommitStats;
</script>

<style>
  .changeset-summary {
    margin: 1.5rem 0;
    margin-left: 1rem;
  }
  .changeset-summary .additions {
    color: var(--color-positive);
  }
  .changeset-summary .deletions {
    color: var(--color-negative);
  }
  .file-header {
    border: 1px solid var(--color-foreground-3);
    border-radius: var(--border-radius-medium);
    height: 3rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: none;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .file-header:last-child {
    margin-bottom: 1rem;
  }
  .file-header .diff-type {
    margin-left: 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius-medium);
  }
  .file-header .diff-type.created {
    color: var(--color-positive);
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
    background-color: var(--color-positive-1);
  }
  .file-header .diff-type.deleted {
    color: var(--color-negative);
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
    background-color: var(--color-negative-1);
  }
  .file-header .file-data {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .browse {
    display: flex;
  }
</style>

<div class="changeset-summary">
  {#if diff.modified.length > 0}
    <span> {diff.modified.length} file(s) changed </span>
    with
    <span class="additions"> {stats.additions} addition(s) </span>
    and
    <span class="deletions"> {stats.deletions} deletion(s) </span>
  {/if}
</div>
<div>
  {#each diff.created as path (path)}
    <header id={path} class="file-header">
      <div class="file-data">
        <p>{path}</p>
        <span class="diff-type created">created</span>
      </div>
      <div class="browse" on:click={() => dispatch("browse", path)}>
        <Icon name="browse" width={20} inline fill />
      </div>
    </header>
  {/each}
  {#each diff.deleted as path (path)}
    <header id={path} class="file-header">
      <div class="file-data">
        <p>{path}</p>
        <span class="diff-type deleted">deleted</span>
      </div>
      <div class="browse" on:click={() => dispatch("browse", path)}>
        <Icon name="browse" width={20} inline fill />
      </div>
    </header>
  {/each}
</div>

{#each diff.modified as file}
  <FileDiff on:browse {file} />
{/each}
