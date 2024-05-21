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
  export let subject: string | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;

  let icon: ComponentProps<IconSmall>["name"] = "clipboard";
  const text = subject ? `Click to copy ${subject}` : "Click to copy";
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
    bottom: 1.5rem;
    left: 0;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 0.5rem;
    justify-content: center;
    z-index: 10;
    background: var(--color-background-float);
    color: var(--color-foreground-default);
    border: 1px solid var(--color-border-hint);
    border-radius: var(--border-radius-small);
    box-shadow: var(--elevation-low);
    font-family: var(--font-family-sans-serif);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    white-space: nowrap;
    padding: 0.25rem 0.5rem;
  }
  .target-commit:hover {
    color: var(--color-foreground-contrast);
  }
  .target-oid:hover {
    color: var(--color-foreground-emphasized-hover);
  }
</style>

<div class="container">
  <div
    role="button"
    tabindex="0"
    on:mouseenter={() => {
      setVisible(true);
    }}
    on:mouseleave={() => {
      setVisible(false);
    }}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="target-{style} global-{style}"
      style:cursor="pointer"
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
</div>
