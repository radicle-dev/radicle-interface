<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let removeable: boolean = false;
  export let key: number;
</script>

<style>
  .chip {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: var(--color-secondary);
  }
  .section {
    display: flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
  }
  .text {
    background-color: var(--color-secondary-3);
    border-radius: var(--border-radius);
  }
  .close {
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
  <span class="section text" class:removeable><slot name="text" /></span>
  {#if removeable}
    <button class="section close" on:click={() => dispatch("remove", key)}>
      ✕
    </button>
  {/if}
</div>
