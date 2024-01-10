<script lang="ts" strictEvents>
  export let ariaLabel: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let variant:
    | "background"
    | "not-selected"
    | "gray"
    | "gray-white"
    | "selected"
    | "none"
    | "outline"
    | "primary-toggle-off"
    | "primary-toggle-on"
    | "secondary"
    | "secondary-toggle-off"
    | "secondary-toggle-on"
    | "secondary-mobile"
    | "secondary-mobile-toggle"
    | "naked-toggle-off"
    | "naked-toggle-on"
    | "tab"
    | "tab-active" = "gray";
  export let size: "small" | "regular" | "large" = "regular";

  export let autofocus: boolean = false;
  export let disabled: boolean = false;
  export let notAllowed: boolean = true;

  export let styleFontFamily: string | undefined = undefined;
  export let stylePadding: string | undefined = undefined;
  export let styleWidth: "100%" | undefined = undefined;
  export let styleBorderRadius: string | undefined = undefined;
  export let styleJustifyContent: "center" | "flex-start" = "center";

  let hover: boolean = false;
</script>

<style>
  button {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    border: none;
    border-radius: var(--border-radius-tiny);
    font-family: var(--font-family-sans-serif);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    font-feature-settings: inherit;
    white-space: nowrap;
    gap: 0.5rem;
    touch-action: manipulation;
  }

  button:disabled {
    color: var(--color-foreground-disabled);
  }
  button:disabled.not-allowed {
    cursor: not-allowed;
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
    color: var(--color-foreground-contrast);
    background-color: var(--color-background-default);
    font-weight: var(--font-weight-regular);
  }
  .background[disabled] {
    color: var(--color-foreground-disabled);
    background-color: var(--color-background-default);
    font-weight: var(--font-weight-regular);
  }
  .background:not([disabled]):hover {
    color: var(--color-foreground-contrast);
    background-color: var(--color-fill-ghost);
  }

  .not-selected {
    background-color: var(--color-fill-float-hover);
    color: var(--color-foreground-contrast);
    font-weight: var(--font-weight-normal);
  }
  .not-selected[disabled] {
    background-color: var(--color-fill-float-hover);
    color: var(--color-fill-secondary);
    font-weight: var(--font-weight-normal);
  }
  .not-selected:not([disabled]):hover {
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-foreground-contrast);
  }

  .gray {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-contrast);
  }
  .gray[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-disabled);
  }
  .gray:not([disabled]):hover {
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-foreground-contrast);
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
  .selected {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-contrast);
    cursor: default;
  }
  .selected[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-disabled);
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
    color: var(--color-foreground-dim);
    border: 1px solid var(--color-border-hint);
  }
  .outline[disabled] {
    background-color: transparent;
    color: var(--color-fill-gray);
  }
  .outline:not([disabled]):hover {
    background-color: transparent;
    border: 1px solid var(--color-border-focus);
  }

  .primary-toggle-on {
    color: var(--color-fill-primary);
    background-color: var(--color-fill-merged);
    border: 1px solid var(--color-border-merged);
  }

  .primary-toggle-on[disabled] {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-primary);
  }

  .primary-toggle-on:not([disabled]):hover {
    border: 1px solid var(--color-border-primary);
  }

  .primary-toggle-off {
    background-color: transparent;
    color: var(--color-foreground-dim);
    border: 1px solid var(--color-border-hint);
  }
  .primary-toggle-off[disabled] {
    background-color: transparent;
    color: var(--color-fill-gray);
  }
  .primary-toggle-off:not([disabled]):hover {
    background-color: transparent;
    border: 1px solid var(--color-border-primary);
    color: var(--color-foreground-dim);
  }

  .secondary-toggle-off {
    background-color: transparent;
    color: var(--color-foreground-contrast);
    border: 1px solid var(--color-border-hint);
  }
  .secondary-toggle-off[disabled] {
    background-color: transparent;
    color: var(--color-fill-gray);
  }
  .secondary-toggle-off:not([disabled]):hover {
    background-color: transparent;
    border: 1px solid var(--color-fill-secondary);
  }

  .secondary-toggle-on {
    background-color: var(--color-fill-selected);
    color: var(--color-foreground-emphasized);
    border: 1px solid var(--color-border-selected);
  }
  .secondary-toggle-on[disabled] {
    background-color: var(--color-fill-selected);
    color: var(--color-fill-gray);
  }
  .secondary-toggle-on:not([disabled]):hover {
    background-color: var(--color-fill-selected);
    border: 1px solid var(--color-border-focus);
  }

  .naked-toggle-off {
    background-color: transparent;
    color: var(--color-foreground-contrast);
    border: 1px solid transparent;
  }
  .naked-toggle-off[disabled] {
    background-color: transparent;
    color: var(--color-fill-gray);
  }
  .naked-toggle-off:not([disabled]):hover {
    background-color: transparent;
    border: 1px solid var(--color-fill-secondary);
  }

  .naked-toggle-on {
    background-color: transparent;
    color: var(--color-foreground-emphasized);
    border: 1px solid transparent;
  }
  .naked-toggle-on[disabled] {
    background-color: transparent;
    color: var(--color-fill-gray);
  }
  .naked-toggle-on:not([disabled]):hover {
    background-color: transparent;
    border: 1px solid var(--color-border-focus);
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

  .secondary-mobile {
    color: var(--color-foreground-dim);
    background-color: var(--color-background-default);
  }

  .secondary-mobile[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-disabled);
  }

  .secondary-mobile:not([disabled]):active {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-secondary);
  }

  .secondary-mobile-toggle {
    color: var(--color-foreground-dim);
    background-color: var(--color-background-default);
  }

  .secondary-mobile-toggle[disabled] {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-disabled);
  }

  .tab {
    background-color: var(--color-background-default);
    color: var(--color-foreground-contrast);
    border: 1px solid transparent;
    border-bottom: 1px solid var(--color-fill-separator);
  }

  .tab[disabled] {
    background-color: var(--color-background-default);
    color: var(--color-foreground-disabled);
  }

  .tab:not([disabled]):hover {
    background-color: var(--color-fill-float-hover);
    border-top-right-radius: var(--border-radius-tiny) !important;
    border-top-left-radius: var(--border-radius-tiny) !important;
  }

  .tab-active {
    background-color: var(--color-background-default);
    border: 1px solid var(--color-fill-separator);
    border-bottom: 1px solid var(--color-background-default);
    color: var(--color-foreground-contrast);
    border-top-right-radius: var(--border-radius-tiny) !important;
    border-top-left-radius: var(--border-radius-tiny) !important;
  }

  .tab-active[disabled] {
    background-color: var(--color-background-default);
    color: var(--color-foreground-disabled);
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
  style:justify-content={styleJustifyContent}
  on:blur
  on:click
  on:focus
  on:mouseout
  on:mouseover
  on:mouseenter={() => {
    hover = true;
  }}
  on:mouseleave={() => {
    hover = false;
  }}
  class:disabled
  class:not-allowed={notAllowed}
  class:small={size === "small"}
  class:regular={size === "regular"}
  class:large={size === "large"}
  class:background={variant === "background"}
  class:not-selected={variant === "not-selected"}
  class:gray-white={variant === "gray-white"}
  class:selected={variant === "selected"}
  class:gray={variant === "gray"}
  class:none={variant === "none"}
  class:outline={variant === "outline"}
  class:primary-toggle-off={variant === "primary-toggle-off"}
  class:primary-toggle-on={variant === "primary-toggle-on"}
  class:secondary-toggle-off={variant === "secondary-toggle-off"}
  class:secondary-toggle-on={variant === "secondary-toggle-on"}
  class:naked-toggle-off={variant === "naked-toggle-off"}
  class:naked-toggle-on={variant === "naked-toggle-on"}
  class:secondary={variant === "secondary"}
  class:secondary-mobile={variant === "secondary-mobile"}
  class:secondary-mobile-toggle={variant === "secondary-mobile-toggle"}
  class:tab={variant === "tab"}
  class:tab-active={variant === "tab-active"}>
  <slot {hover} />
</button>
