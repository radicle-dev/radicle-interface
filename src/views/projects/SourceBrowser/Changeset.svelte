<script lang="ts">
  import type { Diff, DiffStats } from "@app/lib/diff";
  import FileDiff from "@app/views/projects/SourceBrowser/FileDiff.svelte";

  export let diff: Diff;
  export let stats: DiffStats;

  const diffDescription = ({ modified, added, deleted }: Diff): string => {
    const s = [];

    if (modified.length) {
      s.push(`${modified.length} file(s) changed`);
    }
    if (added.length) {
      s.push(`${added.length} file(s) added`);
    }
    if (deleted.length) {
      s.push(`${deleted.length} file(s) deleted`);
    }
    return s.join(", ");
  };
</script>

<style>
  .changeset-summary {
    padding-bottom: 1.5rem;
    margin-left: 1rem;
  }
  .changeset-summary .additions {
    color: var(--color-positive);
  }
  .changeset-summary .deletions {
    color: var(--color-negative);
  }
</style>

<div class="changeset-summary">
  <span>{diffDescription(diff)}</span>
  with
  <span class="additions">{stats.insertions} insertion(s)</span>
  and
  <span class="deletions">{stats.deletions} deletion(s)</span>
</div>
<div class="diff-listing">
  {#each diff.added as file}
    <FileDiff on:browse {file} mode="added" />
  {/each}
  {#each diff.deleted as file}
    <FileDiff on:browse {file} mode="deleted" />
  {/each}
  {#each diff.modified as file}
    <FileDiff on:browse {file} />
  {/each}
</div>
