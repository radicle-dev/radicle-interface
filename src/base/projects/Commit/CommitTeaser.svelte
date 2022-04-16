<script lang="ts">
  import type { CommitMetadata } from "@app/commit";
  import { formatCommit } from "@app/utils";
  import { createEventDispatcher } from "svelte";

  import Icon from "@app/Icon.svelte";
  import CommitAuthorship from "./CommitAuthorship.svelte";

  export let commit: CommitMetadata;

  const dispatch = createEventDispatcher();

  function browseCommit(commit: string) {
    dispatch("browseCommit", commit);
  }
</script>

<style>
  .hash {
    font-family: var(--font-family-monospace);
  }
  .commit-teaser {
    background-color: var(--color-foreground-background);
    padding: 0.5rem 0rem;
  }
  .commit-teaser:hover {
    background-color: var(--color-foreground-background-lighter);
  }
  .commit-teaser:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  .commit-teaser:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  .commit-teaser {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .column-left {
    padding: 0 1.5rem;
  }
  .column-center {
    flex: min-content;
  }
  .commit-teaser .column-right {
    display: flex;
    align-items: center;
    padding-right: 1.5rem;
  }
  .summary {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 1rem;
  }
  .badge {
    margin: 0 1rem 0 0;
  }

  @media (max-width: 720px) {
    .hash {
      padding-right: 0.5rem;
    }
    .hash {
      font-size: 0.75rem;
    }
    .column-center {
      overflow: hidden;
    }
    .column-right {
      display: none !important;
    }
    .summary {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 1rem;
    }
  }
</style>

<div class="commit-teaser">
  <div class="column-left">
    <span class="secondary hash">{formatCommit(commit.header.sha1)}</span>
  </div>
  <div class="column-center">
    <div class="header">
      <div class="summary">
        {commit.header.summary}
      </div>
    </div>
    <CommitAuthorship {commit} />
  </div>
  <div class="column-right">
    {#if commit.context.committer}
      <span class="badge tertiary">Verified</span>
    {/if}
    <Icon name="browse" width={17} inline fill on:click={() => browseCommit(commit.header.sha1)} />
  </div>
</div>
