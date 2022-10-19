<script lang="ts">
  import { onMount } from "svelte";
  import { formatObjectId } from "@app/cobs";
  import type { Issue } from "@app/issue";
  import type { Wallet } from "@app/wallet";
  import { Profile, ProfileType } from "@app/profile";

  import Authorship from "@app/Authorship.svelte";

  export let issue: Issue;
  export let wallet: Wallet;

  let profile: Profile | null = null;

  onMount(async () => {
    if (issue.author.profile?.ens?.name) {
      profile = await Profile.get(
        issue.author.profile.ens.name,
        ProfileType.Minimal,
        wallet,
      );
    }
  });

  const commentCount = issue.countComments();
</script>

<style>
  .issue-teaser {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-foreground-1);
    padding: 0.75rem 0;
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

  .column-left {
    flex: min-content;
  }
  .column-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 1rem;
    flex-basis: 5rem;
  }
  .comment-count {
    color: var(--color-foreground-4);
    font-weight: var(--font-weight-bold);
  }
  .comment-count .emoji {
    margin-right: 0.25rem;
  }

  .state {
    padding: 0 1rem;
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
  .summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 1rem;
  }

  @media (max-width: 720px) {
    .column-left {
      overflow: hidden;
    }
    .summary {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 1rem;
    }
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
      <!-- TODO: Truncation not working on overflow -->
      {issue.title}
      <span class="issue-id">{formatObjectId(issue.id)}</span>
    </div>
    <Authorship
      {profile}
      {wallet}
      caption="opened"
      author={issue.author}
      timestamp={issue.timestamp} />
  </div>
  {#if commentCount > 0}
    <div class="column-right">
      <div class="comment-count">
        <span class="txt-tiny emoji">💬</span>
        <span>{commentCount}</span>
      </div>
    </div>
  {/if}
</div>
