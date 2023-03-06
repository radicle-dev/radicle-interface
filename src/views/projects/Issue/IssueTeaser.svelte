<script lang="ts">
  import type { Issue } from "@app/lib/issue";

  import { formatObjectId } from "@app/lib/cobs";
  import Authorship from "@app/components/Authorship.svelte";
  import Icon from "@app/components/Icon.svelte";

  export let issue: Issue;

  const commentCount = issue.countComments();
</script>

<style>
  .issue-teaser {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr) auto;
    padding: 0.75rem 0;
    background-color: var(--color-foreground-1);
  }
  .issue-teaser:hover {
    background-color: var(--color-foreground-2);
    cursor: pointer;
  }
  .issue-id {
    color: var(--color-foreground-5);
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    margin-left: 0.5rem;
  }
  .summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-right: 2rem;
  }
  .issue-title {
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
  }

  .state {
    justify-self: center;
    align-self: center;
  }
  .state-icon {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: var(--border-radius-small);
  }
  .open {
    background-color: var(--color-positive);
  }
  .closed {
    background-color: var(--color-negative);
  }
</style>

<div class="issue-teaser">
  <div class="state">
    <div
      class="state-icon"
      class:closed={issue.state.status === "closed"}
      class:open={issue.state.status === "open"} />
  </div>
  <div class="column-left">
    <div class="summary">
      <span class="issue-title">{issue.title}</span>
      <span class="issue-id">{formatObjectId(issue.id)}</span>
    </div>
    <Authorship
      caption="opened"
      author={issue.author}
      timestamp={issue.timestamp} />
  </div>
  {#if commentCount > 0}
    <div class="column-right">
      <div class="comment-count">
        <Icon name="chat" />
        <span>{commentCount}</span>
      </div>
    </div>
  {/if}
</div>
