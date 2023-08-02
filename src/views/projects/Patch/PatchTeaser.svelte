<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { Patch } from "@httpd-client";

  import { HttpdClient } from "@httpd-client";
  import { formatObjectId, formatTimestamp } from "@app/lib/utils";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import DiffStatBadge from "@app/components/DiffStatBadge.svelte";
  import Icon from "@app/components/Icon.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";

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

  // Counts the amount of comments in all the discussions over all revisions.
  $: commentCount = patch.revisions.reduce(
    (acc, curr) => acc + curr.discussions.reduce(acc => acc + 1, 0),
    0,
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
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    padding-right: 2rem;
  }
  .patch-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .patch-title:hover {
    text-decoration: underline;
  }
  .right {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-right: 1rem;
    margin-left: auto;
    color: var(--color-foreground-5);
  }
  .state {
    justify-self: center;
    align-self: center;
    margin: 0 1rem 0 1.25rem;
  }
  .labels {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
  .comments {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .draft {
    color: var(--color-foreground-6);
  }
  .open {
    color: var(--color-positive-6);
  }
  .archived {
    color: var(--color-caution-6);
  }
  .merged {
    color: var(--color-primary-6);
  }
  @media (max-width: 960px) {
    .labels {
      display: none;
    }
  }
</style>

<div class="patch-teaser">
  <div
    class="state"
    class:draft={patch.state.status === "draft"}
    class:open={patch.state.status === "open"}
    class:merged={patch.state.status === "merged"}
    class:archived={patch.state.status === "archived"}>
    <Icon name="patch" />
  </div>
  <div>
    <div class="summary">
      <Link
        route={{
          resource: "project.patch",
          project: projectId,
          node: baseUrl,
          patch: patch.id,
        }}>
        <span class="patch-title">
          <InlineMarkdown content={patch.title} />
        </span>
      </Link>
      <span class="labels">
        {#each patch.labels.slice(0, 4) as label}
          <Badge style="max-width:7rem" variant="secondary">
            <span class="label">{label}</span>
          </Badge>
        {/each}
        {#if patch.labels.length > 4}
          <Badge variant="foreground">
            <span class="label">+{patch.labels.length - 4} more labels</span>
          </Badge>
        {/if}
      </span>
    </div>
    <div class="summary">
      <span class="meta id">
        {formatObjectId(patch.id)}
        {patch.revisions.length > 1 ? "updated" : "opened"}
        {formatTimestamp(latestRevision.timestamp)} by
        <Authorship
          authorId={patch.author.id}
          authorAlias={patch.author.alias} />
      </span>
    </div>
  </div>
  <div class="right">
    {#if commentCount > 0}
      <div class="comments">
        <Icon name="chat" />
        <span>{commentCount}</span>
      </div>
    {/if}
    {#await diffPromise then { diff }}
      <DiffStatBadge
        insertions={diff.stats.insertions}
        deletions={diff.stats.deletions} />
    {/await}
  </div>
</div>
