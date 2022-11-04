<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let title: string | undefined = undefined;
  export let active = false;
  export let clickable = false;
  export let notAllowed = false;

  const dispatch = createEventDispatcher();
</script>

<style>
  .stat {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    padding: 0.5rem 0.75rem;
    padding-bottom: 1rem; /* moving the inner text a tad higher to match the previous span usage */
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
  class:active
  class:not-allowed={notAllowed}
  class:clickable
  class="stat clickable"
  on:click={() => {
    if (!notAllowed) dispatch("click");
  }}>
  <slot />
</button>
