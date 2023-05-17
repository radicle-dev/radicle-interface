<script lang="ts" context="module">
  export type Variant =
    | "caution"
    | "foreground"
    | "negative"
    | "positive"
    | "primary"
    | "secondary";
</script>

<script lang="ts">
  export let variant: Variant;
  export let style: string | undefined = undefined;
</script>

<style>
  .badge {
    border-radius: var(--border-radius);
    padding: 0.125rem 0.5rem;
    font-size: var(--font-size-tiny);
    line-height: 1.6;
    height: var(--button-tiny-height);
    display: flex;
    white-space: nowrap;
  }
  .foreground {
    color: var(--color-foreground-6);
    background: var(--color-foreground-3);
  }
  .positive {
    color: var(--color-positive-6);
    background-color: var(--color-positive-3);
  }
  .secondary {
    color: var(--color-secondary-6);
    background-color: var(--color-secondary-3);
  }
  .negative {
    color: var(--color-negative-6);
    background-color: var(--color-negative-3);
  }
  .primary {
    color: var(--color-primary-6);
    background: var(--color-primary-3);
  }
  .caution {
    color: var(--color-caution-6);
    background: var(--color-caution-3);
  }
</style>

<span
  on:mouseenter
  on:mouseleave
  class="badge"
  {style}
  class:caution={variant === "caution"}
  class:foreground={variant === "foreground"}
  class:negative={variant === "negative"}
  class:positive={variant === "positive"}
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}>
  <slot />
</span>
