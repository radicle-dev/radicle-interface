<script lang="ts">
  import type { BaseUrl, CommitBlob, Diff } from "@http-client";

  import FileDiff from "@app/views/projects/Changeset/FileDiff.svelte";
  import FileLocationChange from "@app/views/projects/Changeset/FileLocationChange.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Observer, { intersection } from "@app/components/Observer.svelte";

  export let diff: Diff;
  export let files: Record<string, CommitBlob>;
  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let revision: string;

  let expanded = true;

  function pluralize(singular: string, count: number): string {
    return count === 1 ? singular : `${singular}s`;
  }

  const diffDescription = (diffFiles: Diff["files"]): string =>
    Object.entries(
      diffFiles.reduce(
        (acc, { state }) => {
          acc[state]++;
          return acc;
        },
        { added: 0, modified: 0, deleted: 0, copied: 0, moved: 0 },
      ),
    )
      .filter(([, count]) => count > 0)
      .map(([state, count]) => `${count} ${pluralize("file", count)} ${state}`)
      .join(", ");
</script>

<style>
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem 0.5rem 1rem;
    background-color: var(--color-background-default);
  }
  .additions {
    color: var(--color-foreground-success);
    white-space: nowrap;
  }
  .deletions {
    color: var(--color-foreground-red);
    white-space: nowrap;
  }
  .diff-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: var(--color-background-default);
    padding: 1rem;
  }
  .summary {
    font-size: var(--font-size-small);
  }
  @media (max-width: 719.98px) {
    .diff-list {
      padding: 1rem 0;
    }
  }
</style>

<div class="header">
  <div class="summary">
    <span>{diffDescription(diff.files)}</span>
    with
    <span class:additions={diff.stats.insertions > 0}>
      {diff.stats.insertions}
      {pluralize("insertion", diff.stats.insertions)}
    </span>
    and
    <span class:deletions={diff.stats.deletions > 0}>
      {diff.stats.deletions}
      {pluralize("deletion", diff.stats.deletions)}
    </span>
  </div>
  {#if diff.stats.filesChanged > 1}
    <IconButton on:click={() => (expanded = !expanded)}>
      {#if expanded === true}
        <IconSmall name="collapse" />
        <span class="global-hide-on-mobile-down">Collapse all</span>
      {:else}
        <IconSmall name="expand" />
        <span class="global-hide-on-mobile-down">Expand all</span>
      {/if}
    </IconButton>
  {/if}
</div>

<div class="diff-list">
  <Observer let:filesVisibility let:observer>
    {#each diff.files as file}
      {@const path = "path" in file ? file.path : file.newPath}
      <div use:intersection={observer} id={"observer:" + path}>
        {#if "diff" in file}
          <FileDiff
            {projectId}
            {baseUrl}
            {revision}
            {expanded}
            filePath={path}
            oldFilePath={"oldPath" in file ? file.oldPath : undefined}
            fileDiff={file.diff}
            headerBadgeCaption={file.state}
            content={"new" in file ? files[file.new.oid]?.content : undefined}
            oldContent={"old" in file
              ? files[file.old.oid]?.content
              : undefined}
            visible={filesVisibility.has(path)} />
        {:else}
          <FileLocationChange
            headerBadgeCaption={file.state}
            oldPath={file.oldPath}
            newPath={file.newPath}
            {projectId}
            {baseUrl}
            {revision} />
        {/if}
      </div>
    {/each}
  </Observer>
</div>
