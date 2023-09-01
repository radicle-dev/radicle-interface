<script lang="ts" strictEvents>
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";

  import { toClipboard } from "@app/lib/utils";

  import Icon from "@app/components/Icon.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";

  export let text: string;
  export let small = false;
  export let tooltip: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ copied: null }>();

  let icon: "clipboard" | "checkmark" = "clipboard";

  const restoreIcon = debounce(() => {
    icon = "clipboard";
  }, 800);

  export async function copy() {
    await toClipboard(text);
    dispatch("copied");
    icon = "checkmark";
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
  .small {
    width: 1.5rem;
    height: 1.5rem;
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  title={tooltip}
  class="clipboard"
  class:small
  on:click|stopPropagation={copy}>
  {#if small}
    <IconSmall name={icon} />
  {:else}
    <Icon name={icon} />
  {/if}
</span>
