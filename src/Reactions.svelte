<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";
  import Button from "@app/Button.svelte";

  export let reactions: Record<string, number> | null = null;

  const dispatch = createEventDispatcher<{ click: string }>();
</script>

<style>
  .reactions {
    display: flex;
    gap: 0.5rem;
  }
</style>

{#if reactions}
  <div class="reactions">
    {#each Object.entries(reactions) as [reaction, count]}
      <!-- TODO: Remove the disabled attribute once we are able to increment reactions -->
      <Button
        variant="foreground"
        size="tiny"
        on:click={() => dispatch("click", reaction)}>
        {reaction}
        {count}
      </Button>
    {/each}
  </div>
{/if}
