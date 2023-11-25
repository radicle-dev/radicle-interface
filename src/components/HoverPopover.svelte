<script lang="ts">
  import debounce from "lodash/debounce";

  export let disabled: boolean = false;

  export let onShow: () => void = () => {};
  export let stylePopoverPositionLeft: string | undefined = undefined;
  export let stylePopoverPositionTop: string | undefined = undefined;
  export let stylePopoverPadding: string | undefined = "1rem";

  let visible: boolean = false;

  const setVisible = debounce((value: boolean) => {
    if (!disabled) {
      visible = value;
      if (visible) {
        onShow();
      }
    }
  }, 150);
</script>

<style>
  .popover {
    background: var(--color-background-float);
    border-radius: var(--border-radius-regular);
    border: 1px solid var(--color-border-hint);
    box-shadow: var(--elevation-low);
    position: relative;
    right: 1rem;
    z-index: 10;
  }
</style>

<div
  role="button"
  tabindex="0"
  on:mouseenter={() => setVisible(true)}
  on:mouseleave={() => setVisible(false)}>
  <slot name="toggle" />

  {#if visible}
    <!-- If this component is used inside a button (see `NodeId`, for example)
       we don’t want clicks in the popover to trigger button actions. So we
       stop propagation of click events. -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div style:position="absolute" on:click|stopPropagation>
      <div
        class="popover"
        style:padding={stylePopoverPadding}
        style:left={stylePopoverPositionLeft}
        style:top={stylePopoverPositionTop}>
        <slot name="popover" />
      </div>
    </div>
  {/if}
</div>
