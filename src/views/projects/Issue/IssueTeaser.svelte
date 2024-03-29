<script lang="ts">
  import type { BaseUrl, Issue } from "@httpd-client";

  import {
    absoluteTimestamp,
    formatObjectId,
    formatTimestamp,
  } from "@app/lib/utils";

  import Badge from "@app/components/Badge.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeId from "@app/components/NodeId.svelte";

  export let baseUrl: BaseUrl;
  export let issue: Issue;
  export let projectId: string;

  $: commentCount = issue.discussion.reduce((acc, _curr, index) => {
    if (index !== 0) {
      return acc + 1;
    }
    return acc;
  }, 0);

  let hover = false;
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
  .comment-count {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    height: 1.5rem;
  }
  .labels {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .right {
    display: flex;
    gap: 1rem;
    margin-left: auto;
    color: var(--color-foreground-dim);
    font-size: var(--font-size-tiny);
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

<div
  role="button"
  tabindex="0"
  class="issue-teaser"
  on:mouseenter={() => (hover = true)}
  on:mouseleave={() => (hover = false)}>
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
            <InlineMarkdown fontSize="regular" content={issue.title} />
          {/if}
        </span>
      </Link>
      <span class="labels">
        {#each issue.labels.slice(0, 4) as label}
          <Badge variant={hover ? "background" : "neutral"}>
            {label}
          </Badge>
        {/each}
        {#if issue.labels.length > 4}
          <Badge
            title={issue.labels.slice(4, undefined).join(" ")}
            variant={hover ? "background" : "neutral"}>
            +{issue.labels.length - 4} more labels
          </Badge>
        {/if}
      </span>
      <div class="right">
        {#if commentCount > 0}
          <div style:display="flex" style:gap="1rem">
            <div class="comment-count">
              <IconSmall name="chat" />
              <span>{commentCount}</span>
            </div>
          </div>
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
