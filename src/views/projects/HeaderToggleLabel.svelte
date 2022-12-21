<script lang="ts">
  export let title: string | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let active = false;
  export let clickable = false;
  export let disabled = false;
</script>

<style>
  .stat {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    padding: 0.5rem 0.75rem;
    padding-bottom: 1rem; /* moving the content a tad higher to match the previous span usage */
    height: 2rem;
    background: var(--color-foreground-1);
    border: none;
    color: var(--color-foreground);
    border-radius: var(--border-radius-small);
    min-width: max-content;
  }
  .active {
    color: var(--color-background);
    background: var(--color-foreground) !important;
    background-color: var(--color-foreground);
  }
  .clickable {
    cursor: pointer;
  }
  .clickable:hover {
    background-color: var(--color-foreground-2);
  }
  .not-allowed {
    cursor: not-allowed;
    color: var(--color-foreground-5);
  }
</style>

<button
  {title}
  {disabled}
  class:active
  class:clickable
  class:not-allowed={disabled}
  class="stat"
  aria-label={ariaLabel}
  on:click>
  <slot />
</button>
