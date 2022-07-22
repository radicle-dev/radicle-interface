<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let reactions: Record<string, number> | null = null;

  const dispatch = createEventDispatcher();
</script>

<style>
  .reaction {
    margin-right: 0.6rem;
    padding: 0 0.6rem;
    height: 26px;
    min-width: unset; /* Resets min-width from button in public.css */
  }
</style>

{#if reactions}
  <div class="reactions">
    {#each Object.entries(reactions) as [reaction, count]}
      <!-- TODO: Remove the disabled attribute once we are able to increment reactions -->
      <button disabled class="reaction text-xsmall" on:click={() => dispatch("click", reaction)}>
        {reaction} {count}
      </button>
    {/each}
  </div>
{/if}
