<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import Chip from "@app/components/Chip.svelte";

  export let reactions: Map<string, string[]>;
  export let clickable: boolean = false;

  const dispatch = createEventDispatcher<{
    remove: { nids: string[]; reaction: string };
  }>();
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
  {#each reactions as [reaction, nids], key}
    <Chip
      {key}
      {clickable}
      on:click={() => {
        if (clickable) {
          dispatch("remove", { nids, reaction });
        }
      }}>
      <div class="reaction txt-tiny">
        <span>{reaction}</span>
        <span title={nids.join("\n")}>{nids.length}</span>
      </div>
    </Chip>
  {/each}
</div>
