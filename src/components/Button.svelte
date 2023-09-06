<script lang="ts" strictEvents>
  export let title: string | undefined = undefined;
  export let variant:
    | "background"
    | "dim"
    | "gray"
    | "none"
    | "outline"
    | "primary"
    | "secondary"
    | "tab" = "gray";
  export let size: "small" | "regular" | "large" = "regular";
  export let ariaLabel: string | undefined = undefined;

  export let stylePadding: string | undefined = undefined;
  export let styleFontFamily: string | undefined = undefined;

  export let autofocus: boolean = false;
  export let clickable: boolean = true;
  export let disabled: boolean = false;
  export let hoverable: boolean = true;
  export let stretch: boolean = false;
  export let square: boolean = false;
</script>

<style>
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    background: var(--color-fill-ghost);
    border: none;
    border-radius: var(--border-radius-tiny);
    color: var(--color-foreground);
    font-family: var(--font-family-sans-serif);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    white-space: nowrap;
    gap: 0.5rem;
  }

  .small {
    height: var(--button-tiny-height);
    padding: 0 0.6rem;
  }

  .regular {
    height: var(--button-small-height);
    padding: 0 0.75rem;
  }

  .large {
    border-radius: var(--border-radius-small);
    height: var(--button-regular-height);
    padding: 0 1rem;
    font-size: var(--font-size-small);
  }

  .secondary {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-secondary);
  }

  .background {
    color: var(--color-fill-secondary);
    background-color: var(--color-fill-background);
  }
  .background.hoverable:hover {
    background-color: var(--color-fill-ghost);
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

  .tab {
    background-color: var(--color-fill-secondary);
    color: var(--color-foreground-match-background);
  }
  .tab.hoverable:hover {
    background-color: var(--color-fill-secondary);
  }

  .tab:hover {
    background-color: var(--color-fill-ghost);
  }

  .none {
    background-color: transparent;
    color: var(--color-foreground-emphasized);
  }

  .none:hover {
    background-color: var(--color-fill-ghost);
  }

  .disabled {
    cursor: not-allowed;
  }
  .disabled.secondary {
    color: var(--color-foreground-match-background);
  }
  .disabled:hover {
    background: none;
    box-shadow: none;
  }
  .disabled:hover.secondary {
    background: var(--color-fill-secondary);
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

  .outline {
    background-color: var(--color-background-default);
    color: var(--color-foreground);
    border: none;
    border: 1px solid var(--color-border-hint);
  }
  .outline[disabled] {
    background-color: var(--color-background-default);
    color: var(--color-fill-gray);
  }
  .outline:not([disabled]):hover {
    background-color: var(--color-background-default);
    border: 1px solid var(--color-border-focus);
    color: var(--color-foreground);
  }

  .gray {
    background-color: var(--color-fill-ghost);
    color: var(--color-fill-secondary);
  }
  .gray[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-fill-secondary);
  }
  .gray:not([disabled]).hoverable:hover {
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-fill-secondary);
  }

  .dim {
    background-color: var(--color-fill-float-hover);
    color: var(--color-fill-secondary);
  }
  .dim[disabled] {
    background-color: var(--color-fill-float-hover);
    color: var(--color-fill-secondary);
  }
  .dim:not([disabled]):hover {
    background-color: var(--color-fill-float-hover);
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-fill-secondary);
  }

  .stretch {
    width: 100%;
  }

  .square {
    border-radius: 0;
  }

  .clickable {
    cursor: pointer;
  }
</style>

<!-- svelte-ignore a11y-autofocus -->
<button
  aria-label={ariaLabel}
  {autofocus}
  {disabled}
  {title}
  tabindex="0"
  style:padding={stylePadding}
  style:font-family={styleFontFamily}
  on:blur
  on:click
  on:focus
  on:mouseout
  on:mouseover
  class:hoverable
  class:disabled
  class:clickable
  class:stretch
  class:square
  class:small={size === "small"}
  class:regular={size === "regular"}
  class:large={size === "large"}
  class:background={variant === "background"}
  class:dim={variant === "dim"}
  class:gray={variant === "gray"}
  class:none={variant === "none"}
  class:outline={variant === "outline"}
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  class:tab={variant === "tab"}>
  <slot />
</button>
