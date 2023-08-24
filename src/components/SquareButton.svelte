<script lang="ts" strictEvents>
  export let active: boolean = false;
  export let clickable: boolean = false;
  export let disabled: boolean = false;
  export let hoverable: boolean = true;
  export let size: "small" | "regular" = "regular";
  export let title: string | undefined = undefined;
</script>

<style>
  .square-button {
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.75rem;
    background: var(--color-fill-ghost);
    border: none;
    border-radius: var(--border-radius-small);
    color: var(--color-foreground);
    font-family: var(--font-family-sans-serif);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-tiny);
    white-space: nowrap;
    gap: 0.5rem;
  }

  .small {
    height: var(--button-tiny-height);
  }

  .clickable {
    cursor: pointer;
    user-select: none;
  }

  .active {
    color: var(--color-foreground-match-background);
    background: var(--fill-light);
    background-color: var(--color-fill-secondary);
  }

  .active:hover {
    background-color: var(--fill-light-hover);
  }

  .hoverable:hover {
    background-color: var(--color-fill-ghost-hover);
  }

  .active.hoverable:hover {
    background-color: var(--color-fill-secondary-hover);
  }

  .disabled {
    cursor: not-allowed;
    color: var(--color-foreground-5);
  }
  .disabled.active {
    color: var(--color-background);
  }
  .disabled:hover {
    background: var(--color-foreground-1);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  {title}
  role="button"
  tabindex="0"
  on:click
  class="square-button"
  class:active
  class:hoverable
  class:disabled
  class:small={size === "small"}
  class:clickable>
  <slot name="icon" />
  <div style:display="block">
    <slot />
  </div>
</div>
