<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { Patch } from "@httpd-client";

  import { HttpdClient } from "@httpd-client";
  import { formatObjectId, formatTimestamp } from "@app/lib/utils";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import DiffStatBadge from "@app/components/DiffStatBadge.svelte";
  import Icon from "@app/components/Icon.svelte";

  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let patch: Patch;

  const api = new HttpdClient(baseUrl);

  const latestRevisionIndex = patch.revisions.length - 1;
  const latestRevision = patch.revisions[latestRevisionIndex];
  $: diffPromise = api.project.getDiff(
    projectId,
    latestRevision.base,
    latestRevision.oid,
  );
</script>

<style>
  .patch-teaser {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr) auto;
    padding: 0.75rem 0;
    background-color: var(--color-foreground-1);
  }
  .patch-teaser:hover {
    background-color: var(--color-foreground-2);
    cursor: pointer;
  }
  .meta {
    color: var(--color-foreground-5);
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    margin: 0 0.5rem;
  }
  .id {
    margin: 0;
  }
  .summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding-right: 2rem;
  }
  .patch-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .comment-count {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-right: 1rem;
    gap: 0.5rem;
    color: var(--color-foreground-5);
  }

  .column-right {
    align-self: center;
    justify-self: center;
    padding-right: 1rem;
  }
  .state {
    justify-self: center;
    align-self: center;
  }
  .tags {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
  .tag {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state-icon {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: var(--border-radius-small);
  }
  .highlight {
    color: var(--color-foreground-6);
  }
  .draft {
    background-color: var(--color-foreground-3);
  }
  .open {
    background-color: var(--color-positive);
  }
  .archived {
    background-color: var(--color-negative);
  }
  @media (max-width: 960px) {
    .tags {
      display: none;
    }
  }
</style>

<div class="patch-teaser">
  <div class="state">
    <div
      class="state-icon"
      class:draft={patch.state.status === "draft"}
      class:open={patch.state.status === "open"}
      class:archived={patch.state.status === "archived"} />
  </div>
  <div class="column-left">
    <div class="summary">
      <span class="patch-title">{patch.title}</span>
      <span class="tags">
        {#each patch.tags.slice(0, 4) as tag}
          <Badge style="max-width:7rem" variant="secondary">
            <span class="tag">{tag}</span>
          </Badge>
        {/each}
        {#if patch.tags.length > 4}
          <Badge variant="foreground">
            <span class="tag">+{patch.tags.length - 4} more tags</span>
          </Badge>
        {/if}
      </span>
    </div>
    <div class="summary">
      <span class="meta id">
        <span class="highlight">{formatObjectId(patch.id)}</span>
        opened
        <span class="highlight">
          {formatTimestamp(latestRevision.timestamp)}
        </span>
        by
        <Authorship highlight noAvatar authorId={patch.author.id} />
      </span>
    </div>
  </div>
  <div class="column-right">
    <div class="comment-count">
      {#await diffPromise then { diff }}
        <DiffStatBadge
          insertions={diff.stats.insertions}
          deletions={diff.stats.deletions} />
      {/await}
      {#if latestRevision.discussions.length > 0}
        <Icon name="chat" />
        <span>{latestRevision.discussions.length}</span>
      {/if}
    </div>
  </div>
</div>
