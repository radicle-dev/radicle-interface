<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@httpd-client";

  import { formatCommit, twemoji } from "@app/lib/utils";

  import CommitAuthorship from "./CommitAuthorship.svelte";
  import Icon from "@app/components/Icon.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";

  export let baseUrl: BaseUrl;
  export let commit: CommitHeader;
  export let projectId: string;

  let expandCommitMessage = false;
</script>

<style>
  .teaser {
    display: flex;
    background-color: var(--color-background-float);
    align-items: center;
    padding: 1.5rem;
    font-size: var(--font-size-small);
  }
  .teaser:hover {
    background-color: var(--color-fill-ghost);
  }
  .hash {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-bold);
    color: var(--color-fill-secondary);
  }
  .message {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .expand-toggle {
    background-color: var(--color-background-dip);
    border: 1px solid var(--color-border-hint);
    border-radius: var(--border-radius-tiny);
    color: var(--color-foreground);
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    height: 12px;
    line-height: 6px;
    padding: 0 5px 5px;
  }
  .expand-toggle:hover {
    border: 1px solid var(--color-border-focus);
  }
  .right {
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 1.5rem;
  }
  .summary {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
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
    .left {
      overflow: hidden;
    }
    .browse {
      display: none !important;
    }
  }
</style>

<div class="teaser">
  <div class="left">
    <div class="message">
      <Link
        route={{
          resource: "project.commit",
          project: projectId,
          node: baseUrl,
          commit: commit.id,
        }}>
        <div class="summary" use:twemoji>
          <InlineMarkdown fontSize="regular" content={commit.summary} />
        </div>
      </Link>
      {#if commit.description}
        <button
            style="display: inline;"
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
    <CommitAuthorship header={commit}>
    <span class="hash layout-mobile">{formatCommit(commit.id)}</span>
    </CommitAuthorship>
  </div>
  <div class="right layout-desktop-flex">
    <span class="hash">{formatCommit(commit.id)}</span>
    <div
      class="browse"
      title="Browse the repository at this point in the history">
      <Link
        route={{
          resource: "project.source",
          project: projectId,
          node: baseUrl,
          revision: commit.id,
        }}>
        <Icon name="browse" />
      </Link>
    </div>
  </div>
</div>
