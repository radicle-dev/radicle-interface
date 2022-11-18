<script lang="ts">
  import type { BaseUrl, Diff } from "@httpd-client";

  import { pluralize } from "@app/lib/pluralize";

  import FileDiff from "@app/views/projects/Changeset/FileDiff.svelte";
  import FileLocationChange from "@app/views/projects/Changeset/FileLocationChange.svelte";

  export let diff: Diff;
  export let revision: string;
  export let baseUrl: BaseUrl;
  export let projectId: string;

  const diffDescription = ({
    modified,
    added,
    deleted,
    moved,
    copied,
  }: Diff): string => {
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
    if (copied.length) {
      s.push(`${copied.length} ${pluralize("file", copied.length)} copied`);
    }
    if (moved.length) {
      s.push(`${moved.length} ${pluralize("file", moved.length)} moved`);
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
    color: var(--color-positive-6);
  }
  .changeset-summary .deletions {
    color: var(--color-negative-6);
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
    <FileDiff
      {projectId}
      {baseUrl}
      {revision}
      filePath={file.path}
      fileDiff={file.diff}
      headerBadgeCaption="added" />
  {/each}
  {#each diff.deleted as file}
    <FileDiff
      {projectId}
      {baseUrl}
      {revision}
      filePath={file.path}
      fileDiff={file.diff}
      headerBadgeCaption="deleted" />
  {/each}
  {#each diff.modified as file}
    <FileDiff
      {projectId}
      {baseUrl}
      {revision}
      filePath={file.path}
      fileDiff={file.diff} />
  {/each}
  {#each diff.moved as file}
    {#if file.diff}
      <FileDiff
        {projectId}
        {baseUrl}
        {revision}
        filePath={file.newPath}
        oldFilePath={file.oldPath}
        fileDiff={file.diff}
        headerBadgeCaption="moved" />
    {:else}
      <FileLocationChange
        {projectId}
        {baseUrl}
        {revision}
        newPath={file.newPath}
        oldPath={file.oldPath}
        mode="moved" />
    {/if}
  {/each}
  {#each diff.copied as file}
    <FileLocationChange
      {projectId}
      {baseUrl}
      {revision}
      newPath={file.newPath}
      oldPath={file.oldPath}
      mode="copied" />
  {/each}
</div>
