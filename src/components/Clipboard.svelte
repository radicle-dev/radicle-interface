<script lang="ts" strictEvents>
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";

  import { toClipboard } from "@app/lib/utils";

  import Icon from "@app/components/Icon.svelte";

  export let text: string;
  export let small = false;
  export let tooltip: string | undefined = undefined;

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
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
  .clipboard.small {
    width: 1.5rem;
    height: 1.5rem;
  }
  .clipboard:hover :global(svg) {
    fill: var(--color-foreground);
  }
  .clipboard:hover {
    border-radius: var(--border-radius);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  title={tooltip}
  class="clipboard"
  class:small
  on:click|stopPropagation={copy}>
  <Icon name={icon} />
</span>
