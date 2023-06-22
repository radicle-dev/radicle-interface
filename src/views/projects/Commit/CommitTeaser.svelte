<script lang="ts">
  import type { CommitHeader } from "@httpd-client";

  import { formatCommit, twemoji } from "@app/lib/utils";

  import CommitAuthorship from "./CommitAuthorship.svelte";
  import Icon from "@app/components/Icon.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";

  export let commit: CommitHeader;

  let expandCommitMessage = false;
</script>

<style>
  .teaser {
    background-color: var(--color-foreground-1);
    padding: 0.75rem 0rem;
    display: flex;
    align-items: center;
  }
  .teaser:hover {
    background-color: var(--color-foreground-2);
  }
  .hash {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    padding: 0 1.5rem;
  }
  .left {
    padding-left: 1rem;
  }
  .message {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  .expand-toggle {
    background-color: var(--color-foreground-2);
    border: 1px solid var(--color-foreground-5);
    border-radius: var(--border-radius-tiny);
    color: var(--color-foreground);
    cursor: pointer;
    font-weight: var(--font-weight-medium);
    height: 12px;
    line-height: 6px;
    padding: 0 5px 5px;
  }
  .expand-toggle:hover {
    background-color: var(--color-foreground-5);
  }
  .right {
    display: flex;
    align-items: center;
    padding-right: 1.5rem;
    margin-left: auto;
  }
  .summary {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: var(--font-size-small);
  }
  .summary:hover {
    text-decoration: underline;
  }
  .browse {
    display: flex;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 720px) {
    .hash {
      padding-right: 0;
    }
    .left {
      overflow: hidden;
    }
    .browse {
      display: none !important;
    }
    .summary {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
</style>

<div class="teaser">
  <div class="left">
    <div class="message">
      <ProjectLink
        projectParams={{
          view: { resource: "commits" },
          revision: commit.id,
          search: undefined,
        }}>
        <div class="summary" use:twemoji>
          <InlineMarkdown content={commit.summary} />
        </div>
      </ProjectLink>
      {#if commit.description}
        <button
          class:expand-open={expandCommitMessage}
          class="expand-toggle txt-tiny"
          on:click={() => (expandCommitMessage = !expandCommitMessage)}>
          …
        </button>
      {/if}
    </div>
    {#if expandCommitMessage}
      <div style:margin="0.5rem 0">
        <pre
          class="txt-monospace txt-tiny"
          style:margin="0">{commit.description.trim()}</pre>
      </div>
    {/if}
    <CommitAuthorship header={commit} />
  </div>
  <div class="right">
    <span class="hash txt-highlight">{formatCommit(commit.id)}</span>
    <div
      class="browse"
      title="Browse the repository at this point in the history">
      <ProjectLink
        projectParams={{
          view: { resource: "tree" },
          revision: commit.id,
        }}>
        <Icon name="browse" />
      </ProjectLink>
    </div>
  </div>
</div>
