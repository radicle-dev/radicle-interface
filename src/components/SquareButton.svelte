<script lang="ts" strictEvents>
  export let clickable: boolean = false;
  export let disabled: boolean = false;
  export let hoverable: boolean = true;
  export let size: "small" | "regular" | "large" = "regular";
  export let title: string | undefined = undefined;
  export let variant: "primary" | "secondary" | "gray" = "gray";
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

  .large {
    height: var(--button-regular-height);
    padding: 0 1rem;
    font-size: var(--font-size-small);
  }

  .clickable {
    cursor: pointer;
    user-select: none;
  }

  .primary {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-primary);
  }

  .primary:hover {
    background-color: var(--color-fill-primary-hover);
  }

  .primary.hoverable:hover {
    background-color: var(--color-fill-primary-hover);
  }

  .secondary {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-secondary);
  }

  .secondary:hover {
    background-color: var(--fill-light-hover);
  }

  .secondary.hoverable:hover {
    background-color: var(--color-fill-secondary-hover);
  }

  .hoverable:hover {
    background-color: var(--color-fill-ghost-hover);
  }

  .disabled {
    cursor: not-allowed;
  }
  .disabled.secondary {
    color: var(--color-foreground-match-background);
  }
  .disabled:hover {
    background: var(--color-fill-ghost);
  }
  .disabled:hover.secondary {
    background: var(--color-fill-secondary);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  {title}
  role="button"
  tabindex="0"
  on:click
  class="square-button"
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  class:gray={variant === "gray"}
  class:hoverable
  class:disabled
  class:small={size === "small"}
  class:large={size === "large"}
  class:clickable>
  <slot name="icon" />
  <div style:display="block">
    <slot />
  </div>
</div>
