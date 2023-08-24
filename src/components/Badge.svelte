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
    color: var(--color-foreground-match-background);
    background: var(--color-fill-gray);
  }
  .positive {
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-success);
  }
  .secondary {
    color: var(--color-foreground-black);
    background-color: var(--color-fill-secondary);
  }
  .negative {
    color: var(--color-foreground-black);
    background-color: var(--color-fill-danger);
  }
  .primary {
    color: var(--color-foreground-match-background);
    background: var(--color-fill-primary);
  }
  .caution {
    color: var(--color-foreground-black);
    background: var(--color-fill-yellow);
  }
</style>

<!-- svelte-ignore a11y-no-static-element-interactions -->
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
