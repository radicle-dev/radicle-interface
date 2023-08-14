<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ remove: number; click: null }>();

  export let removeable: boolean = false;
  export let clickable: boolean = false;
  export let key: number;
</script>

<style>
  .chip {
    user-select: none;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: var(--color-secondary);
  }
  .clickable:hover {
    cursor: pointer;
    background-color: var(--color-secondary-5);
  }
  .section {
    display: flex;
    align-items: center;
    max-width: 13.5rem;
    padding: 0.2rem 0.5rem;
  }
  .text {
    background-color: var(--color-secondary-3);
    border-radius: var(--border-radius);
  }
  .close {
    align-self: stretch;
    color: var(--color-secondary);
    border: none;
    border-bottom-right-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    background-color: var(--color-secondary-2);
    line-height: 1.5;
    cursor: pointer;
  }
  .close:hover {
    background-color: var(--color-secondary-5);
    color: var(--color-foreground);
  }
  .removeable {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
</style>

<div class="chip">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <span class="section text" class:removeable class:clickable on:click>
    <slot />
  </span>
  {#if removeable}
    <button class="section close" on:click={() => dispatch("remove", key)}>
      ✕
    </button>
  {/if}
</div>
