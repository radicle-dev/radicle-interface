<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@http-client";

  import { twemoji } from "@app/lib/utils";

  import CommitLink from "@app/views/projects/components/CommitLink.svelte";
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
    padding: 0.125rem 0;
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
    padding: 0 0.5rem;
    flex-direction: column;
  }
  .right {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
    height: 21px;
  }
  .summary:hover {
    text-decoration: underline;
  }
  .commit-message {
    margin: 0.5rem 0;
    font-size: var(--font-size-tiny);
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
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
        <div style="height: 21px; display: flex; align-items: center;">
          <ExpandButton
            variant="inline"
            on:toggle={() => {
              commitMessageVisible = !commitMessageVisible;
            }} />
        </div>
      {/if}
    </div>
    {#if commitMessageVisible}
      <div class="commit-message" style:margin="0.5rem 0">
        <pre>{commit.description.trim()}</pre>
      </div>
    {/if}
    <div class="global-hide-on-small-desktop-up">
      <CompactCommitAuthorship {commit}>
        <CommitLink {baseUrl} {projectId} commitId={commit.id} />
      </CompactCommitAuthorship>
    </div>
  </div>
  <div class="right">
    <div style="display: flex; gap: 0.5rem; height: 21px; align-items: center;">
      <div class="global-hide-on-mobile-down">
        <CompactCommitAuthorship {commit}>
          <CommitLink {baseUrl} {projectId} commitId={commit.id} />
        </CompactCommitAuthorship>
      </div>
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
