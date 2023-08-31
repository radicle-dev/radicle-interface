<script lang="ts">
  import type { BaseUrl, Issue } from "@httpd-client";

  import { formatObjectId, formatTimestamp } from "@app/lib/utils";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Icon from "@app/components/Icon.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";

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
    background-color: var(--color-background-float);
    padding: 1.5rem;
  }
  .issue-teaser:hover {
    background-color: var(--color-fill-ghost);
  }
  .content {
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
  }
  .subtitle {
    color: var(--color-foreground-6);
    font-size: var(--font-size-small);
    flex-wrap: wrap;
  }
  .summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  .issue-title {
    cursor: pointer;
    font-weight: var(--font-weight-medium);
  }
  .issue-title:hover {
    text-decoration: underline;
  }
  .comment-count {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-foreground-5);
  }
  .labels {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hash {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-bold);
    color: var(--color-fill-secondary);
  }
  .right {
    align-self: center;
    justify-self: center;
    margin-left: auto;
  }
  .state {
    justify-self: center;
    align-self: center;
    margin-right: 1.5rem;
  }
  .open {
    color: var(--color-fill-success);
  }
  .closed {
    color: var(--color-fill-danger);
  }

  @media (max-width: 960px) {
    .labels {
      display: none;
    }
  }
</style>

<div class="issue-teaser">
  <div
    class="state"
    class:closed={issue.state.status === "closed"}
    class:open={issue.state.status === "open"}>
    <Icon name="issue" />
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
          <InlineMarkdown fontSize="regular" content={issue.title} />
        </span>
      </Link>
      <span class="labels">
        {#each issue.labels.slice(0, 4) as label}
          <Badge style="max-width:7rem" variant="secondary">
            <span class="label">{label}</span>
          </Badge>
        {/each}
        {#if issue.labels.length > 4}
          <Badge variant="foreground">
            <span class="label">+{issue.labels.length - 4} more labels</span>
          </Badge>
        {/if}
      </span>
    </div>
    <div class="summary subtitle">
      <span class="hash">{formatObjectId(issue.id)}</span>
      opened {formatTimestamp(issue.discussion[0].timestamp)} by
      <Authorship authorId={issue.author.id} authorAlias={issue.author.alias} />
    </div>
  </div>
  {#if commentCount > 0}
    <div class="right">
      <div class="comment-count">
        <Icon name="chat" />
        <span>{commentCount}</span>
      </div>
    </div>
  {/if}
</div>
