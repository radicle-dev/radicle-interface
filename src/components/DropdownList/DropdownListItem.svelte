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
    gap: 0.5rem;
    padding: 0.5rem;
    white-space: nowrap;
    border-radius: var(--border-radius-tiny);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    color: var(--color-foreground-dim);
  }
  .item:hover,
  .selected {
    background-color: var(--color-fill-ghost);
  }
  .selected {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-secondary);
  }
  .item:hover.selected {
    background-color: var(--color-fill-secondary-hover);
  }
  .item:hover.selected.disabled {
    background-color: var(--color-fill-secondary);
  }
  .item:hover.disabled {
    cursor: not-allowed;
    background-color: var(--color-background-float);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="item" class:selected class:disabled {title} on:click>
  <slot />
</div>
