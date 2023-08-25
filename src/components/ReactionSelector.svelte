<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import config from "@app/config.json";

  export let nid: string;
  export let reactions: Map<string, string[]>;

  const dispatch = createEventDispatcher<{
    select: { nids: string[]; reaction: string };
  }>();
</script>

<style>
  .selector {
    display: flex;
    align-items: center;
    background-color: var(--color-background-1);
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-foreground-3);
    box-shadow: var(--elevation-low);
    padding: 0.2rem;
    gap: 0.2rem;
  }
  .selector button {
    padding: 0.5rem;
    border: 0;
    background-color: transparent;
  }
  .selector button.active {
    border-radius: var(--border-radius-small);
    background-color: var(--color-background);
  }
  .selector button:hover {
    cursor: pointer;
    border-radius: var(--border-radius-small);
    background-color: var(--color-background);
  }
</style>

<div class="selector">
  {#each config.reactions as reaction}
    <button
      class:active={reactions.get(reaction)?.includes(nid)}
      on:click={() => {
        dispatch("select", {
          nids: reactions.get(reaction) ?? [],
          reaction,
        });
      }}>
      {reaction}
    </button>
  {/each}
</div>
