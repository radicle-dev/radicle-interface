<script lang="ts">
  export let variant:
    | "caution"
    | "foreground"
    | "negative"
    | "positive"
    | "primary"
    | "tertiary";
</script>

<style>
  .badge {
    border-radius: var(--border-radius);
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    line-height: 1.6;
    height: var(--button-tiny-height);
    display: flex;
  }
  .foreground {
    color: var(--color-foreground-faded);
    background: var(--color-foreground-background);
  }
  .positive {
    color: var(--color-positive);
    background-color: var(--color-positive-1);
  }
  .negative {
    color: var(--color-negative);
    background-color: var(--color-negative-1);
  }
  .primary {
    color: var(--color-primary);
    background: var(--color-primary-background);
  }
  .tertiary {
    color: var(--color-tertiary);
    background: var(--color-tertiary-background);
  }
  .caution {
    color: var(--color-yellow);
    background: var(--color-yellow-background);
  }
</style>

<span
  on:mouseenter
  on:mouseleave
  class="badge"
  class:caution={variant === "caution"}
  class:foreground={variant === "foreground"}
  class:negative={variant === "negative"}
  class:positive={variant === "positive"}
  class:primary={variant === "primary"}
  class:tertiary={variant === "tertiary"}>
  <slot />
</span>
