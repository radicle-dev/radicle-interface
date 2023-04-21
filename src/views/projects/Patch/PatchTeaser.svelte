<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { Patch } from "@httpd-client";

  import { HttpdClient } from "@httpd-client";
  import { formatObjectId, formatTimestamp } from "@app/lib/utils";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import DiffStatBadge from "@app/components/DiffStatBadge.svelte";
  import Icon from "@app/components/Icon.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";

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
    display: flex;
    padding: 0.75rem 0;
    background-color: var(--color-foreground-1);
  }
  .patch-teaser:hover {
    background-color: var(--color-foreground-2);
  }
  .meta {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-foreground-6);
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    margin: 0 0.5rem;
  }
  .id {
    margin: 0;
  }
  .summary {
    padding-right: 2rem;
  }
  .patch-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .patch-title:hover {
    color: var(--color-secondary);
  }
  .comment-count {
    align-items: center;
    padding-right: 1rem;
    gap: 0.5rem;
    color: var(--color-foreground-5);
  }
  .right {
    align-self: center;
    justify-self: center;
    padding-right: 1rem;
    margin-left: auto;
  }
  .state {
    justify-self: center;
    align-self: center;
    margin: 0 1.25rem;
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
  .draft {
    background-color: var(--color-foreground-4);
  }
  .open {
    background-color: var(--color-positive);
  }
  .archived {
    background-color: var(--color-caution);
  }
  .merged {
    background-color: var(--color-primary);
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
      class:merged={patch.state.status === "merged"}
      class:archived={patch.state.status === "archived"} />
  </div>
  <div>
    <div class="summary">
      <ProjectLink
        projectParams={{
          view: {
            resource: "patch",
            params: { patch: patch.id },
          },
        }}>
        <span class="patch-title">{patch.title}</span>
      </ProjectLink>
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
        {formatObjectId(patch.id)} opened {formatTimestamp(
          latestRevision.timestamp,
        )} by
        <Authorship authorId={patch.author.id} />
      </span>
    </div>
  </div>
  <div class="right">
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
