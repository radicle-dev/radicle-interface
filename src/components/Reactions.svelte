<script lang="ts">
  import type { Comment } from "@httpd-client";

  import IconButton from "./IconButton.svelte";

  export let reactions: Comment["reactions"];
  export let handleReaction:
    | ((authors: string[], reaction: string) => Promise<void>)
    | undefined;
</script>

<style>
  .reactions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.875rem;
  }
  .reaction {
    display: inline-flex;
    flex-direction: row;
    gap: 0.5rem;
  }
</style>

<div class="reactions">
  {#each reactions as { emoji, authors }}
    <IconButton
      on:click={async () => {
        if (handleReaction) {
          await handleReaction(authors, emoji);
        }
      }}>
      <div class="reaction txt-tiny">
        <span>{emoji}</span>
        <span title={authors.join("\n")}>{authors.length}</span>
      </div>
    </IconButton>
  {/each}
</div>
