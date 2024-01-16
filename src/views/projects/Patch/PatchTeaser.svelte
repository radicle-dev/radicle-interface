<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { Patch } from "@httpd-client";

  import { HttpdClient } from "@httpd-client";
  import { formatObjectId, formatTimestamp } from "@app/lib/utils";

  import Badge from "@app/components/Badge.svelte";
  import DiffStatBadge from "@app/components/DiffStatBadge.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import Loading from "@app/components/Loading.svelte";

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
  let hover = false;
</script>

<style>
  .patch-teaser {
    display: flex;
    padding: 1.25rem;
    background-color: var(--color-background-float);
  }
  .patch-teaser:hover {
    background-color: var(--color-fill-float-hover);
  }
  .content {
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
  }
  .subtitle {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-small);
    flex-wrap: wrap;
  }
  .summary {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
  .patch-title:hover {
    text-decoration: underline;
  }
  .right {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-left: auto;
  }
  .state {
    justify-self: center;
    align-self: flex-start;
    margin-right: 0.5rem;
    padding: 0.25rem 0;
  }
  .labels {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
  .comments {
    color: var(--color-foreground-dim);
    font-size: var(--font-size-tiny);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .draft {
    color: var(--color-foreground-dim);
  }
  .open {
    color: var(--color-fill-success);
  }
  .archived {
    color: var(--color-foreground-yellow);
  }
  .merged {
    color: var(--color-fill-primary);
  }
</style>

<div
  role="button"
  tabindex="0"
  class="patch-teaser"
  on:mouseenter={() => (hover = true)}
  on:mouseleave={() => (hover = false)}>
  <div
    class="state"
    class:draft={patch.state.status === "draft"}
    class:open={patch.state.status === "open"}
    class:merged={patch.state.status === "merged"}
    class:archived={patch.state.status === "archived"}>
    <IconSmall name="patch" />
  </div>
  <div class="content">
    <div class="summary">
      <Link
        route={{
          resource: "project.patch",
          project: projectId,
          node: baseUrl,
          patch: patch.id,
        }}>
        <span class="patch-title">
          <InlineMarkdown fontSize="regular" content={patch.title} />
        </span>
      </Link>
      <span class="labels">
        {#each patch.labels.slice(0, 4) as label}
          <Badge
            style="max-width:7rem"
            variant={hover ? "background" : "neutral"}>
            <span class="label">{label}</span>
          </Badge>
        {/each}
        {#if patch.labels.length > 4}
          <Badge
            title={patch.labels.slice(4, undefined).join(" ")}
            variant={hover ? "background" : "neutral"}>
            <span class="label">+{patch.labels.length - 4} more labels</span>
          </Badge>
        {/if}
      </span>
    </div>
    <div class="summary">
      <span class="subtitle">
        <span class="global-hash">{formatObjectId(patch.id)}</span>
        {patch.revisions.length > 1 ? "updated" : "opened"}
        {formatTimestamp(latestRevision.timestamp)} by
        <NodeId nodeId={patch.author.id} alias={patch.author.alias} />
      </span>
    </div>
  </div>
  <div class="right">
    <div style:display="flex" style:gap="1rem">
      {#if commentCount > 0}
        <div class="comments">
          <IconSmall name="chat" />
          <span>{commentCount}</span>
        </div>
      {/if}
      {#await diffPromise}
        <Loading small />
      {:then { diff }}
        <DiffStatBadge
          insertions={diff.stats.insertions}
          deletions={diff.stats.deletions} />
      {/await}
    </div>
  </div>
</div>
