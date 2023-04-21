<script lang="ts">
  import type { Diff } from "@httpd-client";

  import { pluralize } from "@app/lib/pluralize";

  import FileDiff from "@app/views/projects/SourceBrowser/FileDiff.svelte";

  export let diff: Diff;
  export let revision: string;

  const diffDescription = ({ modified, added, deleted }: Diff): string => {
    const s = [];

    if (modified.length) {
      s.push(
        `${modified.length} ${pluralize("file", modified.length)} changed`,
      );
    }
    if (added.length) {
      s.push(`${added.length} ${pluralize("file", added.length)} added`);
    }
    if (deleted.length) {
      s.push(`${deleted.length} ${pluralize("file", deleted.length)} deleted`);
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
  <span class="additions">
    {diff.stats.insertions}
    {pluralize("insertion", diff.stats.insertions)}
  </span>
  and
  <span class="deletions">
    {diff.stats.deletions}
    {pluralize("deletion", diff.stats.deletions)}
  </span>
</div>
<div class="diff-listing">
  {#each diff.added as file}
    <FileDiff on:browse {file} {revision} mode="added" />
  {/each}
  {#each diff.deleted as file}
    <FileDiff on:browse {file} {revision} mode="deleted" />
  {/each}
  {#each diff.modified as file}
    <FileDiff on:browse {file} {revision} />
  {/each}
</div>
