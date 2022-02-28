<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let items: { key: string; value: string; badge: string | null }[];
  export let selected: string | null;
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
    position: absolute;
  }
  .dropdown-item {
    cursor: pointer;
    padding: 0.5rem 1rem;
  }
  .dropdown-item:hover, .selected {
    background-color: var(--color-foreground-background-lighter);
  }
  .dropdown .badge {
    margin: 0;
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
    {#each items as {key, value, badge}}
      {#if key && value}
        <div class="dropdown-item" class:selected={value === selected} on:click={() => onSelect(value)} title={value}>{@html key}
          {#if badge}
            <span class="badge primary">{badge}</span>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
{/if}
