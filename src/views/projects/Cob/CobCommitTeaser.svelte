<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@httpd-client";

  import { twemoji } from "@app/lib/utils";

  import CompactCommitAuthorship from "@app/components/CompactCommitAuthorship.svelte";
  import ExpandButton from "@app/components/ExpandButton.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
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
    font-size: var(--font-size-small);
    align-items: start;
  }
  .message {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .left {
    display: flex;
    gap: 0.5rem;
  }
  .right {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-left: auto;
    margin-top: -0.25rem;
  }
  .summary:hover {
    text-decoration: underline;
  }
  .commit-message {
    margin: 0.5rem 0;
    font-size: var(--font-size-tiny);
  }
</style>

<div class="teaser" aria-label="commit-teaser">
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
          <InlineMarkdown fontSize="small" content={commit.summary} />
        </div>
      </Link>
      {#if commit.description}
        <ExpandButton
          variant="inline"
          on:toggle={() => {
            commitMessageVisible = !commitMessageVisible;
          }} />
      {/if}
    </div>
    {#if commitMessageVisible}
      <div class="commit-message" style:margin="0.5rem 0">
        <pre>{commit.description.trim()}</pre>
      </div>
    {/if}
  </div>
  <div class="right">
    <div style="display: flex; gap: 0.5rem; height: 2rem; align-items: center;">
      <CompactCommitAuthorship {commit} />
      <IconButton title="Browse repo at this commit">
        <Link
          route={{
            resource: "project.source",
            project: projectId,
            node: baseUrl,
            revision: commit.id,
          }}>
          <IconSmall name="chevron-left-right" />
        </Link>
      </IconButton>
    </div>
  </div>
</div>
