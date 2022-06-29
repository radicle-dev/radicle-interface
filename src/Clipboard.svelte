<script lang="ts">
  import Icon from '@app/Icon.svelte';
  import { toClipboard } from '@app/utils';

  export let text: string;
  export let small = false;
</script>

<style>
  .clipboard {
    width: 32px;
    height: 32px;
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
    stroke: var(--color-foreground-90);
  }
  .clipboard:active :global(svg) {
    stroke: var(--color-positive);
  }
  .clipboard:hover {
    border-radius: var(--border-radius);
  }
</style>

<span class="clipboard" class:small on:click|stopPropagation={() => toClipboard(text)}>
  {#if small}
    <Icon name="clipboard-small" width={12} height={12} />
  {:else}
    <Icon name="clipboard" width={16} height={16} />
  {/if}
</span>
