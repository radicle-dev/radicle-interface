<script lang="ts">
  import type { Patch } from "@app/lib/patch";

  import { formatObjectId } from "@app/lib/cobs";
  import { twemoji } from "@app/lib/utils";

  import Authorship from "@app/components/Authorship.svelte";

  export let patch: Patch;

  const commentCount = patch.countComments(patch.revisions.length - 1);
</script>

<style>
  .patch-teaser {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-foreground-1);
    padding: 0.75rem 0;
  }
  .patch-teaser:hover {
    background-color: var(--color-foreground-2);
    cursor: pointer;
  }
  .patch-id {
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
    border-radius: 0.5rem;
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

<div class="patch-teaser">
  <div class="state">
    <div
      class="state-icon"
      class:closed={patch.state === "archived"}
      class:open={patch.state === "proposed"} />
  </div>
  <div class="column-left">
    <div class="summary">
      <!-- TODO: Truncation not working on overflow -->
      {patch.title}
      <span class="patch-id">{formatObjectId(patch.id)}</span>
    </div>
    <Authorship
      caption="opened"
      author={patch.author}
      timestamp={patch.timestamp} />
  </div>
  {#if commentCount > 0}
    <div class="column-right">
      <div class="comment-count">
        <span class="txt-tiny emoji" use:twemoji>💬</span>
        <span>{commentCount}</span>
      </div>
    </div>
  {/if}
</div>
