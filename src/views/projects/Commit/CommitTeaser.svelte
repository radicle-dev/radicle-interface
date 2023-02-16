<script lang="ts" strictEvents>
  import type { CommitMetadata } from "@app/lib/commit";
  import { formatCommit, twemoji } from "@app/lib/utils";
  import { createEventDispatcher } from "svelte";

  import Icon from "@app/components/Icon.svelte";
  import CommitAuthorship from "./CommitAuthorship.svelte";

  export let commit: CommitMetadata;

  const dispatch = createEventDispatcher<{ browseCommit: string }>();

  function browseCommit(commit: string) {
    dispatch("browseCommit", commit);
  }
</script>

<style>
  .hash {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    padding: 0 1.5rem;
  }
  .commit-teaser {
    background-color: var(--color-background-1);
    padding: 0.75rem 0rem;
  }
  .commit-teaser:hover {
    background-color: var(--color-foreground-2);
    cursor: pointer;
  }
  .commit-teaser:first-child {
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }
  .commit-teaser:last-child {
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }
  .commit-teaser:not(:last-child) {
    border-bottom: 1px solid var(--color-background);
  }
  .commit-teaser {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .column-left {
    padding-left: 1rem;
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
  .browse {
    display: flex;
    z-index: 10;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 720px) {
    .hash {
      padding-right: 0;
    }
    .column-left {
      overflow: hidden;
    }
    .browse {
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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="commit-teaser" on:click>
  <div class="column-left">
    <div class="header">
      <div class="summary" use:twemoji>
        {commit.commit.summary}
      </div>
    </div>
    <CommitAuthorship {commit} noDelegate />
  </div>
  <div class="column-right">
    <span class="hash txt-highlight">{formatCommit(commit.commit.id)}</span>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="browse"
      title="Browse the repository at this point in the history"
      on:click|stopPropagation={() => browseCommit(commit.commit.id)}>
      <Icon name="browse" />
    </div>
  </div>
</div>
