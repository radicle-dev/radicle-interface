<script lang="ts">
  export let selected: boolean;
  export let disabled: boolean = false;
  export let title: string | undefined = undefined;
</script>

<style>
  .item {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 0.375rem;
    padding: 1.25rem 0.625rem;
    white-space: nowrap;
    border-radius: var(--border-radius-tiny);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    color: var(--color-foreground-contrast);
    height: 2rem;
  }
  .item.disabled {
    color: var(--color-foreground-disabled);
  }
  .item:hover,
  .selected {
    background-color: var(--color-fill-ghost);
  }
  .selected {
    font-weight: var(--font-weight-semibold);
    color: var(--color-foreground-contrast);
    background-color: var(--color-fill-ghost);
  }
  .item:hover.selected {
    background-color: var(--color-fill-ghost-hover);
  }
  .item:hover.selected.disabled {
    background-color: var(--color-fill-ghost);
  }
  .item:hover.disabled {
    cursor: not-allowed;
    background-color: var(--color-background-float);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  role="button"
  tabindex="0"
  class="item"
  class:selected
  class:disabled
  {title}
  on:click>
  <slot />
</div>
