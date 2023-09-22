<script lang="ts">
  import type {
    BaseUrl,
    Diff,
    CommitBlob,
    DiffContent,
    DiffFile,
  } from "@httpd-client";

  import { pluralize } from "@app/lib/pluralize";

  import FileDiff from "@app/views/projects/Changeset/FileDiff.svelte";
  import FileLocationChange from "@app/views/projects/Changeset/FileLocationChange.svelte";

  export let diff: Diff;
  // This only is needed in commit view where we have a useful revision.
  export let revision: string | undefined = undefined;
  // This only is needed for patch changesets where we have different files with different last commits.
  export let files: Record<string, CommitBlob> = {};
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

  // Since libgit2 optimizes around not loading the content, when no content callbacks are configured,
  // and we don't want to loop over all diffs in radicle-surf to get a correct answer.
  // We assume that a `blobExecutable` file with no hunks is a binary file.
  function getFileType(diff: DiffContent, file: DiffFile): DiffContent["type"] {
    return file.mode === "blobExecutable" && diff.hunks.length === 0
      ? "binary"
      : diff.type;
  }
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
      revision={revision ?? files[file.new.oid].lastCommit.id}
      content={files[file.new.oid].content}
      filePath={file.path}
      fileDiff={{ ...file.diff, type: getFileType(file.diff, file.new) }}
      headerBadgeCaption="added" />
  {/each}
  {#each diff.deleted as file}
    <FileDiff
      {projectId}
      {baseUrl}
      revision={revision ?? files[file.old.oid].lastCommit.id}
      content={files[file.old.oid].content}
      filePath={file.path}
      fileDiff={{ ...file.diff, type: getFileType(file.diff, file.old) }}
      headerBadgeCaption="deleted" />
  {/each}
  {#each diff.modified as file}
    <FileDiff
      {projectId}
      {baseUrl}
      revision={revision ?? files[file.new.oid].lastCommit.id}
      oldContent={files[file.old.oid].content}
      content={files[file.new.oid].content}
      filePath={file.path}
      fileDiff={{ ...file.diff, type: getFileType(file.diff, file.new) }} />
  {/each}
  {#each diff.moved as file}
    {#if file.diff}
      <FileDiff
        {projectId}
        {baseUrl}
        {revision}
        content=""
        filePath={file.newPath}
        oldFilePath={file.oldPath}
        fileDiff={file.diff}
        headerBadgeCaption="moved" />
    {:else}
      <FileLocationChange
        {projectId}
        {baseUrl}
        newPath={file.newPath}
        oldPath={file.oldPath}
        mode="moved" />
    {/if}
  {/each}
  {#each diff.copied as file}
    <FileLocationChange
      {projectId}
      {baseUrl}
      newPath={file.newPath}
      oldPath={file.oldPath}
      mode="copied" />
  {/each}
</div>
