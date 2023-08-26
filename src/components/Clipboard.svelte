<script lang="ts" strictEvents>
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";

  import { toClipboard } from "@app/lib/utils";

  import Icon from "@app/components/Icon.svelte";

  export let text: string;
  export let small = false;
  export let tooltip: string | undefined = undefined;
  export let withText: boolean = false;

  const dispatch = createEventDispatcher<{ copied: null }>();

  let icon: "clipboard-small" | "checkmark-small" | "clipboard" | "checkmark" =
    small ? "clipboard-small" : "clipboard";

  const restoreIcon = debounce(() => {
    icon = small ? "clipboard-small" : "clipboard";
  }, 800);

  async function copy() {
    await toClipboard(text);
    dispatch("copied");
    icon = small ? "checkmark-small" : "checkmark";
    restoreIcon();
  }
</script>

<style>
  .clipboard {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    border: 1px solid var(--color-border-hint);
    border-radius: 0.125rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    align-items: center;
    user-select: none;
    color: var(--color-foreground-emphasized);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
  }

  .clipboard-text {
    white-space: nowrap;
    overflow: hidden;
  }

  .clipboard.small {
    height: 1.5rem;
  }
  .clipboard :global(svg) {
    fill: var(--color-foreground-emphasized);
  }
  .clipboard:hover :global(svg) {
    fill: var(--color-foreground-emphasized-hover);
  }
  .clipboard:hover {
    color: var(--color-foreground-emphasized-hover);
    border: 1px solid var(--color-border-default);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<span
  title={tooltip}
  class="clipboard"
  class:small
  on:click|stopPropagation={copy}>
  {#if withText}
    <span class="clipboard-text">{text}</span>
  {/if}
  <Icon name={icon} />
</span>
