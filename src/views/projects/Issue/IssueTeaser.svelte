<script lang="ts">
  import type { BaseUrl, Issue } from "@httpd-client";

  import {
    absoluteTimestamp,
    formatObjectId,
    formatTimestamp,
  } from "@app/lib/utils";

  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeId from "@app/components/NodeId.svelte";

  import CommentCounter from "../CommentCounter.svelte";
  import Labels from "../Cob/Labels.svelte";

  export let baseUrl: BaseUrl;
  export let issue: Issue;
  export let projectId: string;

  $: commentCount = issue.discussion.reduce((acc, _curr, index) => {
    if (index !== 0) {
      return acc + 1;
    }
    return acc;
  }, 0);
</script>

<style>
  .issue-teaser {
    display: flex;
    padding: 1.25rem;
    background-color: var(--color-background-float);
  }
  .issue-teaser:hover {
    background-color: var(--color-fill-float-hover);
  }
  .content {
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .subtitle {
    font-size: var(--font-size-small);
    flex-wrap: wrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .summary {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .issue-title:hover {
    text-decoration: underline;
  }
  .right {
    display: flex;
    margin-left: auto;
    min-height: 1.5rem;
    align-items: center;
  }
  .state {
    justify-self: center;
    align-self: flex-start;
    margin-right: 0.5rem;
    padding: 0.25rem 0;
  }
  .open {
    color: var(--color-fill-success);
  }
  .closed {
    color: var(--color-foreground-red);
  }
</style>

<div role="button" tabindex="0" class="issue-teaser">
  <div
    class="state"
    class:closed={issue.state.status === "closed"}
    class:open={issue.state.status === "open"}>
    <IconSmall name="issue" />
  </div>
  <div class="content">
    <div class="summary">
      <Link
        route={{
          resource: "project.issue",
          project: projectId,
          node: baseUrl,
          issue: issue.id,
        }}>
        <span class="issue-title">
          {#if !issue.title}
            <span class="txt-missing">No title</span>
          {:else}
            <InlineMarkdown fontSize="regular" content={issue.title}>
              {#if issue.labels.length > 0}
                <span
                  style="display: inline-flex; gap: 0.5rem; flex-wrap: wrap;">
                  <Labels labels={issue.labels} />
                </span>
              {/if}
            </InlineMarkdown>
          {/if}
        </span>
      </Link>
      <div class="right">
        {#if commentCount > 0}
          <CommentCounter {commentCount} />
        {/if}
      </div>
    </div>
    <div class="subtitle">
      <NodeId
        stylePopoverPositionLeft="-13px"
        nodeId={issue.author.id}
        alias={issue.author.alias} />
      opened
      <span class="global-oid">{formatObjectId(issue.id)}</span>
      <span title={absoluteTimestamp(issue.discussion[0].timestamp)}>
        {formatTimestamp(issue.discussion[0].timestamp)}
      </span>
    </div>
  </div>
</div>
