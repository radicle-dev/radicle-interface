<script lang="ts" strictEvents>
  import type { State } from "@app/lib/issue";

  import { createEventDispatcher } from "svelte";
  import { twemoji } from "@app/lib/utils";

  import Badge from "@app/components/Badge.svelte";

  type T = $$Generic<State | string>;

  interface Item {
    key: string;
    title: string;
    value: T;
    badge: string | null;
  }

  export let items: Item[];
  export let selected: string | null = null;

  const dispatch = createEventDispatcher<{ select: Item }>();
  const onSelect = (item: Item) => {
    dispatch("select", item);
  };
</script>

<style>
  .dropdown {
    background-color: var(--color-background-1);
    margin-top: 0.5rem;
    padding: 0.5rem 0;
    position: absolute;
    box-shadow: var(--elevation-low);
    z-index: 10;
    border-radius: var(--border-radius-small);
  }

  .dropdown-item {
    white-space: nowrap;
    cursor: pointer;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dropdown-item:hover,
  .selected {
    background-color: var(--color-foreground-2);
  }
  @media (max-width: 720px) {
    .dropdown {
      left: 32px;
      z-index: 10;
    }
  }
</style>

<div class="dropdown">
  {#each items as item}
    {#if item.key && item.value}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="dropdown-item"
        class:selected={item.value === selected}
        use:twemoji
        on:click={() => onSelect(item)}
        title={item.title}>
        {@html item.key}
        {#if item.badge}
          <Badge variant="primary">{item.badge}</Badge>
        {/if}
      </div>
    {/if}
  {/each}
</div>
