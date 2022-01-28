<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let items: string[];
  export let visible = false;

  const dispatch = createEventDispatcher();
  const onSelect = (item: string) => {
    dispatch("select", item);
  };
</script>

<style>
  .dropdown {
    background-color: var(--color-foreground-background);
    padding: 0.5rem 0;
    margin-top: 0.5rem;
    border-radius: 0.25rem;
    position: absolute;
    box-shadow: 8px 8px 24px var(--color-shadow);
  }
  .dropdown-item {
    cursor: pointer;
    padding: 0.5rem 1rem;
  }
  .dropdown-item:hover {
    background-color: var(--color-foreground-background-lighter);
  }

  @media (max-width: 720px) {
    .dropdown {
      left: 32px;
      z-index: 10;
    }
  }
</style>

{#if visible}
  <div class="dropdown">
    {#each items as item}
      <div class="dropdown-item" on:click={() => onSelect(item)}>{item}</div>
    {/each}
  </div>
{/if}
