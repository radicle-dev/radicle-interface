<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@httpd-client";

  import { formatCommit, twemoji } from "@app/lib/utils";

  import CommitAuthorship from "./CommitAuthorship.svelte";
  import ExpandButton from "@app/components/ExpandButton.svelte";
  import Icon from "@app/components/Icon.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";

  export let baseUrl: BaseUrl;
  export let commit: CommitHeader;
  export let projectId: string;

  let commitMessageVisible = false;
</script>

<style>
  .teaser {
    display: flex;
    align-items: center;
    padding: 1.25rem;
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
    background-color: transparent;
    border-radius: var(--border-radius-tiny);
    color: var(--color-foreground-dim);
    cursor: pointer;
    display: flex;
    width: 100%;
    height: 100%;
    padding: 0 0.25rem;
  }
  .browse:hover {
    color: var(--color-foreground-contrast);
    background-color: var(--color-fill-ghost-hover);
    padding: 0 0.25rem;
  }
  .commit-message {
    margin: 0.5rem 0;
    font-size: var(--font-size-regular);
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
        <ExpandButton
          variant="foreground"
          bind:expanded={commitMessageVisible} />
      {/if}
    </div>
    {#if commitMessageVisible}
      <div class="commit-message" style:margin="0.5rem 0">
        <pre style:margin="0">{commit.description.trim()}</pre>
      </div>
    {/if}
    <CommitAuthorship header={commit}>
      <span class="hash">{formatCommit(commit.id)}</span>
    </CommitAuthorship>
  </div>
  <div class="right layout-desktop-flex">
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
