<script lang="ts">
  import type { ComponentProps } from "svelte";

  import { debounce } from "lodash";

  import { formatObjectId } from "@app/lib/utils";
  import { toClipboard } from "@app/lib/utils";

  import IconSmall from "./IconSmall.svelte";

  export let id: string;
  export let clipboard: string = id;
  export let shorten: boolean = true;
  export let style: "oid" | "commit" | "none" = "oid";
  export let ariaLabel: string | undefined = undefined;

  let icon: ComponentProps<IconSmall>["name"] = "clipboard";
  const text = "Click to copy";
  let tooltip = text;

  const restoreIcon = debounce(() => {
    icon = "clipboard";
    tooltip = text;
    visible = false;
  }, 1000);

  async function copy() {
    await toClipboard(clipboard);
    icon = "checkmark";
    tooltip = "Copied to clipboard";
    restoreIcon();
  }

  let visible: boolean = false;
  export let debounceTimeout = 50;

  const setVisible = debounce((value: boolean) => {
    visible = value;
  }, debounceTimeout);
</script>

<style>
  .container {
    position: relative;
    display: inline-block;
  }
  .popover {
    position: absolute;
    left: 1rem;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 0.5rem;
    justify-content: center;
    z-index: 20;
    bottom: 1.5rem;
    background: var(--color-fill-ghost);
    color: var(--color-fill-gray);
    border: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-tiny);
    box-shadow: var(--elevation-low);
    font-family: var(--font-family-sans-serif);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    white-space: nowrap;
    padding: 0.125rem 0.5rem;
  }
  .target-commit:hover {
    color: var(--color-foreground-contrast);
  }
  .target-oid:hover {
    color: var(--color-foreground-emphasized-hover);
  }
</style>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    on:mouseenter={() => {
      setVisible(true);
    }}
    on:mouseleave={() => {
      setVisible(false);
    }}
    class="target-{style} global-{style}"
    style:cursor="copy"
    aria-label={ariaLabel}
    on:click={async () => {
      await copy();
      setVisible(true);
    }}
    role="button"
    tabindex="0">
    <slot>
      {#if shorten}
        {formatObjectId(id)}
      {:else}
        {id}
      {/if}
    </slot>
  </div>

  {#if visible}
    <div style:position="absolute">
      <div class="popover">
        <IconSmall name={icon} />
        {tooltip}
      </div>
    </div>
  {/if}
</div>
