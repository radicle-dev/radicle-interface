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
  export let size: "tiny" | "small" | "medium" = "tiny";
</script>

<style>
  .badge {
    border-radius: var(--border-radius-round);
    font-size: var(--font-size-tiny);
    font-weight: var(--font-weight-bold);
    line-height: 1.6;
    height: var(--button-tiny-height);
    display: flex;
    white-space: nowrap;
    align-items: center;
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
    color: var(--color-foreground-match-background);
    background-color: var(--color-fill-secondary);
  }
  .negative {
    color: var(--color-foreground-match-background);
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
  .tiny {
    height: 1.375rem;
    font-size: var(--font-size-tiny);
    padding: 0.25rem 0.5rem;
  }
  .small {
    height: 2rem;
    font-size: var(--font-size-small);
    padding: 0.5rem 0.75rem;
  }
  .medium {
    height: 2.5rem;
    font-size: var(--font-size-small);
    padding: 0.75rem 1rem;
  }
</style>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  on:mouseenter
  on:mouseleave
  class="badge"
  {style}
  class:tiny={size === "tiny"}
  class:small={size === "small"}
  class:medium={size === "medium"}
  class:caution={variant === "caution"}
  class:foreground={variant === "foreground"}
  class:negative={variant === "negative"}
  class:positive={variant === "positive"}
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}>
  <slot />
</span>
