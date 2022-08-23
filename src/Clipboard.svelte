<script lang="ts">
  import Icon from '@app/Icon.svelte';
  import { toClipboard } from '@app/utils';
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const copy = () => {
    toClipboard(text);
    dispatch("copied");
  };

  export let text: string;
  export let small = false;
</script>

<style>
  .clipboard {
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  .clipboard.small {
    width: 24px;
    height: 24px;
  }
  .clipboard:hover :global(svg) {
    fill: var(--color-foreground-90);
  }
  .clipboard:active :global(svg) {
    fill: var(--color-positive);
  }
  .clipboard:hover {
    border-radius: var(--border-radius);
  }
</style>

<span class="clipboard" class:small on:click|stopPropagation={copy}>
  {#if small}
    <Icon name="clipboard-small" />
  {:else}
    <Icon name="clipboard" />
  {/if}
</span>
