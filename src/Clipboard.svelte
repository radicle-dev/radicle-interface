<script lang="ts" strictEvents>
  import Icon from "@app/Icon.svelte";
  import { toClipboard } from "@app/utils";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ copied: never }>();

  const copy = () => {
    toClipboard(text);
    dispatch("copied");
  };

  export let text: string;
  export let small = false;
</script>

<style>
  .clipboard {
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  .clipboard.small {
    width: 1.5rem;
    height: 1.5rem;
  }
  .clipboard:hover :global(svg) {
    fill: var(--color-foreground);
  }
  .clipboard:active :global(svg) {
    fill: var(--color-foreground-6);
  }
  .clipboard:hover {
    border-radius: var(--border-radius);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span class="clipboard" class:small on:click|stopPropagation={copy}>
  {#if small}
    <Icon name="clipboard-small" />
  {:else}
    <Icon name="clipboard" />
  {/if}
</span>
