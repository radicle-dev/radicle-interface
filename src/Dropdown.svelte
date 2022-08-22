<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let items: { key: string; title: string; value: string; badge: string | null }[];
  export let selected: string | null = null;

  const dispatch = createEventDispatcher();
  const onSelect = (item: string) => {
    dispatch("select", item);
  };
</script>

<style>
  .dropdown-item {
    white-space: nowrap;
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

<div class="dropdown">
  {#each items as {key, value, badge, title}}
    {#if key && value}
      <div class="dropdown-item" class:selected={value === selected} on:click={() => onSelect(value)} {title}>{@html key}
        {#if badge}
          <span class="badge primary">{badge}</span>
        {/if}
      </div>
    {/if}
  {/each}
</div>
