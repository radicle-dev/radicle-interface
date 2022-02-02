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
    border-radius: 0.5rem;
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
    border-radius: 0.25rem;
  }
  .file-header .diff-type.created {
    color: var(--color-positive);
    background-color: var(--color-positive-1);
  }
  .file-header .diff-type.deleted {
    color: var(--color-negative);
    background-color: var(--color-negative-1);
  }
  .file-header .file-data {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>

<div class="changeset-summary">
  {#if diff.modified.length > 0}
    <span class="bold"> {diff.modified.length} file(s) changed </span>
    with
    <span class="additions bold"> {stats.additions} additions </span>
    and
    <span class="deletions bold"> {stats.deletions} deletions </span>
  {/if}
</div>
<div>
  {#each diff.created as path (path)}
    <header id={path} class="file-header">
      <div class="file-data">
        <p class="bold">{path}</p>
        <span class="diff-type created">created</span>
      </div>
      <Icon class="clickable" name="browse" width={20} inline fill
        on:click={() => dispatch("browse", path)} />
    </header>
  {/each}
  {#each diff.deleted as path (path)}
    <header id={path} class="file-header">
      <div class="file-data">
        <p class="bold">{path}</p>
        <span class="diff-type deleted">deleted</span>
      </div>
      <Icon class="clickable" name="browse" width={20} inline fill
        on:click={() => dispatch("browse", path)} />
    </header>
  {/each}
</div>

{#each diff.modified as file}
  <FileDiff on:browse {file} />
{/each}
