<script lang="ts">
  import type { BaseUrl } from "@http-client";
  import type { Patch } from "@http-client";

  import {
    absoluteTimestamp,
    formatObjectId,
    formatTimestamp,
  } from "@app/lib/utils";

  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeId from "@app/components/NodeId.svelte";

  import Labels from "../Cob/Labels.svelte";
  import DiffStatBadgeLoader from "../DiffStatBadgeLoader.svelte";
  import CommentCounter from "../CommentCounter.svelte";

  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let patch: Patch;

  const latestRevisionIndex = patch.revisions.length - 1;
  const latestRevision = patch.revisions[latestRevisionIndex];

  $: commentCount = patch.revisions.reduce(
    (acc, curr) => acc + curr.discussions.reduce(acc => acc + 1, 0),
    0,
  );
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
    width: 100%;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
  }
  .subtitle {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    font-size: var(--font-size-small);
    gap: 0.5rem;
  }
  .summary {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    word-break: break-word;
  }
  .right {
    margin-left: auto;
    display: flex;
    align-items: flex-start;
  }
  .state {
    justify-self: center;
    align-self: flex-start;
    margin-right: 0.5rem;
    padding: 0.25rem 0;
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
  .diff-comment {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    min-height: 1.5rem;
  }
</style>

<div role="button" tabindex="0" class="patch-teaser">
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
        styleHoverState
        route={{
          resource: "project.patch",
          project: projectId,
          node: baseUrl,
          patch: patch.id,
        }}>
        <InlineMarkdown fontSize="regular" content={patch.title} />
      </Link>
      {#if patch.labels.length > 0}
        <span
          class="global-hide-on-small-desktop-down"
          style="display: inline-flex; gap: 0.5rem;">
          <Labels labels={patch.labels} />
        </span>
      {/if}
      <div class="right">
        <div class="diff-comment">
          {#if commentCount > 0}
            <CommentCounter {commentCount} />
          {/if}
          <DiffStatBadgeLoader {projectId} {baseUrl} {patch} {latestRevision} />
        </div>
      </div>
    </div>
    <div class="summary">
      <span class="subtitle">
        {#if patch.labels.length > 0}
          <div
            class="global-hide-on-medium-desktop-up"
            style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <Labels labels={patch.labels} />
          </div>
        {/if}
        <div
          style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <NodeId
            stylePopoverPositionLeft="-13px"
            nodeId={patch.author.id}
            alias={patch.author.alias} />
          {patch.revisions.length > 1 ? "updated" : "opened"}
          <span class="global-oid">{formatObjectId(patch.id)}</span>
          {#if patch.revisions.length > 1}
            <span class="global-hide-on-mobile-down">
              to <span class="global-oid">
                {formatObjectId(patch.revisions[patch.revisions.length - 1].id)}
              </span>
            </span>
          {/if}
          <span title={absoluteTimestamp(latestRevision.timestamp)}>
            {formatTimestamp(latestRevision.timestamp)}
          </span>
        </div>
      </span>
    </div>
  </div>
</div>
