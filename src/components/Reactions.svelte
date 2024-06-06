<script lang="ts">
  import type { Comment } from "@http-client";

  import IconButton from "./IconButton.svelte";

  export let reactions: Comment["reactions"];
  export let handleReaction:
    | ((
        authors: Comment["reactions"][0]["authors"],
        reaction: string,
      ) => Promise<void>)
    | undefined;

  function authorsToTooltip(authors: Comment["reactions"][0]["authors"]) {
    return authors.map(a => a.alias ?? a.id).join("\n");
  }
</script>

<style>
  .reactions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .reaction {
    display: inline-flex;
    flex-direction: row;
    gap: 0.5rem;
  }
</style>

<div class="reactions">
  {#each reactions as { emoji, authors }}
    <div title={authorsToTooltip(authors)}>
      {#if handleReaction}
        <IconButton
          on:click={async () => {
            if (handleReaction) {
              await handleReaction(authors, emoji);
            }
          }}>
          <div class="reaction txt-tiny">
            <span>{emoji}</span>
            <span>{authors.length}</span>
          </div>
        </IconButton>
      {:else}
        <div class="reaction txt-tiny" style="padding: 2px 4px;">
          <span>{emoji}</span>
          <span>{authors.length}</span>
        </div>
      {/if}
    </div>
  {/each}
</div>
