<script lang="ts">
  export let variant:
    | "caution"
    | "foreground"
    | "background"
    | "neutral"
    | "negative"
    | "positive"
    | "primary"
    | "secondary";
  export let style: string | undefined = undefined;
  export let size: "tiny" | "small" | "medium" = "tiny";
  export let title: string | undefined = undefined;
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
    gap: 0.25rem;
    max-width: 13.5rem;
  }
  .background {
    color: currentColor;
    background: var(--color-background-float);
  }
  .foreground {
    color: var(--color-foreground-match-background);
    background: var(--color-foreground-gray);
  }
  .neutral {
    color: var(--color-foreground-contrast);
    background: var(--color-fill-ghost);
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
    color: var(--color-foreground-white);
    background-color: var(--color-foreground-red);
  }
  .primary {
    color: var(--color-foreground-match-background);
    background: var(--color-fill-primary);
  }
  .caution {
    color: var(--color-foreground-black);
    background: var(--color-foreground-yellow);
  }
  .tiny {
    height: 1.375rem;
    font-size: var(--font-size-tiny);
    font-weight: var(--font-weight-semibold);
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

<span
  role="button"
  tabindex="0"
  on:mouseenter
  on:mouseleave
  class="badge"
  {style}
  {title}
  class:tiny={size === "tiny"}
  class:small={size === "small"}
  class:medium={size === "medium"}
  class:caution={variant === "caution"}
  class:background={variant === "background"}
  class:foreground={variant === "foreground"}
  class:neutral={variant === "neutral"}
  class:negative={variant === "negative"}
  class:positive={variant === "positive"}
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}>
  <slot />
</span>
