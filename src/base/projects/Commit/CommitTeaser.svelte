<script lang="ts">
  import Icon from "@app/Icon.svelte";
  import type { CommitHeader } from "@app/commit";
  import { formatCommit } from "@app/utils";
  import { createEventDispatcher } from "svelte";
  import { formatCommitTime } from "@app/commit";

  export let commit: CommitHeader;

  const dispatch = createEventDispatcher();

  function browseCommit(commit: string) {
    dispatch("browseCommit", commit);
  }
</script>

<style>
  .hash {
    font-family: var(--font-family-monospace);
    padding: 0 1rem 0 0;
  }
  .author {
    margin-right: 0.5rem;
    white-space: nowrap;
  }
  .commit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }
  .commit .right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  .summary {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 1rem;
  }
  .time {
    margin-right: 0.5rem;
    white-space: nowrap;
  }

  @media (max-width: 960px) {
    .hash {
      padding-right: 0.5rem;
    }
    .time, .author, .hash {
      font-size: 0.75rem;
    }
    .summary {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 1rem;
    }
  }
</style>

<div class="commit">
  <div class="summary">
    <span class="secondary hash">{formatCommit(commit.sha1)}</span>
    <span>{commit.summary}</span>
  </div>
  <div class="right">
    <span class="desktop-inline bold author">{commit.committer.name}</span>
    <span class="desktop-inline font-mono text-small time">{formatCommitTime(commit.committerTime)}</span>
    <Icon name="browse" width={17} inline fill on:click={() => browseCommit(commit.sha1)} />
  </div>
</div>
