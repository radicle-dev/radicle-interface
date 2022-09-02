<script lang="ts">
  export let title: string | undefined = undefined;
  export let variant:
    | "foreground"
    | "negative"
    | "primary"
    | "secondary"
    | "text";
  export let size: "tiny" | "small" | "regular" = "regular";

  export let disabled: boolean = false;
  export let waiting: boolean = false;
  export let style: string | undefined = undefined;
</script>

<style>
  button {
    background: transparent;
    border-radius: var(--border-radius-round);
    border: 1px solid var(--color-foreground-6);
    cursor: pointer;
    font-family: var(--font-family-sans-serif);
    font-feature-settings: "ss01", "ss02", "cv01", "cv03";
    font-size: 1rem;
    line-height: 1.6rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  button[disabled] {
    cursor: not-allowed;
  }
  button:not([disabled]):hover {
    color: var(--color-background);
  }
  .foreground {
    color: var(--color-foreground-6);
  }
  .foreground[disabled] {
    color: var(--color-foreground-faded);
    border-color: var(--color-foreground-faded);
  }
  .foreground:not([disabled]):hover {
    background-color: var(--color-foreground);
  }

  .primary {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
  .primary[disabled] {
    color: var(--color-primary-faded);
    border-color: var(--color-primary-faded);
  }
  .primary:not([disabled]):hover {
    background-color: var(--color-primary);
  }

  .secondary {
    color: var(--color-secondary);
    border-color: var(--color-secondary);
  }
  .secondary[disabled] {
    color: var(--color-secondary-faded);
    border-color: var(--color-secondary-faded);
  }
  .secondary:not([disabled]):hover {
    background-color: var(--color-secondary);
  }

  .negative {
    color: var(--color-negative);
    border-color: var(--color-negative);
  }
  .negative[disabled] {
    color: var(--color-negative-faded);
    border-color: var(--color-negative-faded);
  }
  .negative:not([disabled]):hover {
    background-color: var(--color-negative);
  }

  .text {
    color: var(--color-foreground-6);
    border: none;
  }
  .text[disabled] {
    color: var(--color-foreground-4);
  }
  .text:not([disabled]):hover {
    background-color: var(--color-foreground);
  }

  .tiny {
    font-size: 0.75rem;
    height: var(--button-small-tiny);
    padding: 0 0.6rem;
  }
  .small {
    font-size: 0.875rem;
    height: var(--button-small-height);
    padding: 0 0.75rem;
  }
  .regular {
    height: var(--button-regular-height);
    padding: 0 1.5rem;
    min-width: 6rem;
  }

  .waiting {
    cursor: waiting;
  }
</style>

<button
  {title}
  {disabled}
  {style}
  on:click|stopPropagation
  on:focus
  on:blur
  on:mouseout
  on:mouseover
  class:foreground={variant === "foreground"}
  class:negative={variant === "negative"}
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  class:text={variant === "text"}
  class:tiny={size === "tiny"}
  class:small={size === "small"}
  class:regular={size === "regular"}
  class:waiting>
  <slot />
</button>
