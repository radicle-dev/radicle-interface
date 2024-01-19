<script lang="ts">
  import type { GroupedReactions } from "@app/lib/reactions";

  import IconButton from "./IconButton.svelte";

  export let reactions: GroupedReactions;
  export let handleReaction:
    | ((nids: string[], reaction: string) => Promise<void>)
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
  {#each reactions as [reaction, { all: nids }]}
    <IconButton
      on:click={async () => {
        if (handleReaction) {
          await handleReaction(nids, reaction);
        }
      }}>
      <div class="reaction txt-tiny">
        <span>{reaction}</span>
        <span title={nids.join("\n")}>{nids.length}</span>
      </div>
    </IconButton>
  {/each}
</div>
