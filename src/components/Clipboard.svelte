<svelte:options customElement="radicle-clipboard" />

<script lang="ts" strictEvents>
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";

  import { toClipboard } from "@app/lib/utils";

  import Icon from "@app/components/Icon.svelte";

  export let text: string;
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
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  role="button"
  tabindex="0"
  title={tooltip}
  class="clipboard"
  on:click|stopPropagation={copy}>
  <Icon name={icon} />
</span>
