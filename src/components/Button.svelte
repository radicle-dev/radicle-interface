<script lang="ts" strictEvents>
  export let ariaLabel: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let variant:
    | "background"
    | "dim"
    | "gray"
    | "gray-white"
    | "none"
    | "outline"
    | "primary"
    | "secondary"
    | "tab" = "gray";
  export let size: "small" | "regular" | "large" = "regular";

  export let autofocus: boolean = false;
  export let disabled: boolean = false;

  export let styleFontFamily: string | undefined = undefined;
  export let stylePadding: string | undefined = undefined;
  export let styleWidth: "100%" | undefined = undefined;
  export let styleBorderRadius: string | undefined = undefined;
</script>

<style>
  button {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--border-radius-tiny);
    font-family: var(--font-family-sans-serif);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    white-space: nowrap;
    gap: 0.5rem;
  }

  button:disabled {
    cursor: not-allowed;
    color: var(--color-foreground-disabled);
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
  }

  .background {
    color: var(--color-fill-secondary);
    background-color: var(--color-background-default);
  }
  .background[disabled] {
    color: var(--color-foreground-disabled);
    background-color: var(--color-background-default);
  }
  .background:not([disabled]):hover {
    background-color: var(--color-fill-ghost);
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
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-fill-secondary);
  }

  .gray {
    background-color: var(--color-fill-ghost);
    color: var(--color-fill-secondary);
  }
  .gray[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-disabled);
  }
  .gray:not([disabled]):hover {
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-fill-secondary);
  }

  .gray-white {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-contrast);
  }
  .gray-white[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-disabled);
  }
  .gray-white:not([disabled]):hover {
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-foreground-contrast);
  }

  .none {
    background-color: transparent;
    color: var(--color-foreground-emphasized);
  }
  .none[disabled] {
    background-color: transparent;
    color: var(--color-foreground-emphasized);
  }
  .none:not([disabled]):hover {
    background-color: var(--color-fill-ghost);
  }

  .outline {
    background-color: transparent;
    color: var(--color-foreground-contrast);
    border: 1px solid var(--color-border-hint);
  }
  .outline[disabled] {
    background-color: transparent;
    color: var(--color-fill-gray);
  }
  .outline:not([disabled]):hover {
    background-color: transparent;
    border: 1px solid var(--color-border-focus);
    color: var(--color-foreground-contrast);
  }

  .primary {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-primary);
  }

  .primary[disabled] {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-primary);
  }

  .primary:not([disabled]):hover {
    background-color: var(--color-fill-primary-hover);
  }

  .secondary {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-secondary);
  }

  .secondary[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-disabled);
  }

  .secondary:not([disabled]):hover {
    background-color: var(--color-fill-secondary-hover);
  }

  .tab {
    background-color: var(--color-fill-secondary);
    color: var(--color-foreground-match-background);
  }

  .tab[disabled] {
    background-color: var(--color-fill-secondary);
    color: var(--color-foreground-match-background);
  }

  .tab:not([disabled]):hover {
    background-color: var(--color-fill-secondary-hover);
  }
</style>

<!-- svelte-ignore a11y-autofocus -->
<button
  aria-label={ariaLabel}
  {autofocus}
  {disabled}
  {title}
  tabindex="0"
  style:font-family={styleFontFamily}
  style:padding={stylePadding}
  style:width={styleWidth}
  style:border-radius={styleBorderRadius}
  on:blur
  on:click
  on:focus
  on:mouseout
  on:mouseover
  class:disabled
  class:small={size === "small"}
  class:regular={size === "regular"}
  class:large={size === "large"}
  class:background={variant === "background"}
  class:dim={variant === "dim"}
  class:gray={variant === "gray"}
  class:gray-white={variant === "gray-white"}
  class:none={variant === "none"}
  class:outline={variant === "outline"}
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  class:tab={variant === "tab"}>
  <slot />
</button>
