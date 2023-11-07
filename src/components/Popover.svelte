<script lang="ts" context="module">
  import { writable } from "svelte/store";
  const focused = writable<HTMLDivElement | undefined>(undefined);

  export function closeFocused() {
    focused.set(undefined);
  }
</script>

<script lang="ts">
  export let popoverBorderRadius: string | undefined = undefined;
  export let popoverPadding: string | undefined = undefined;
  export let popoverPositionBottom: string | undefined = undefined;
  export let popoverPositionLeft: string | undefined = undefined;
  export let popoverPositionRight: string | undefined = undefined;
  export let popoverPositionTop: string | undefined = undefined;
  export let popoverWidth: string | undefined = undefined;

  let expanded = false;
  let thisComponent: HTMLDivElement;

  function clickOutside(ev: MouseEvent | TouchEvent) {
    if (!$focused?.contains(ev.target as HTMLDivElement)) {
      closeFocused();
    }
  }

  function toggle() {
    expanded = !expanded;
    if ($focused === thisComponent) {
      closeFocused();
    } else {
      focused.set(thisComponent);
    }
  }

  $: expanded = $focused === thisComponent;
</script>

<style>
  .popover {
    background: var(--color-background-float);
    border-radius: var(--border-radius-regular);
    border: 1px solid var(--color-border-hint);
    box-shadow: var(--elevation-low);
    padding: 1rem;
    position: absolute;
    z-index: 10;
  }
</style>

<svelte:window on:click={clickOutside} on:touchstart={clickOutside} />

<div bind:this={thisComponent} style:position="relative">
  <slot name="toggle" {expanded} {toggle} />

  {#if expanded}
    <div
      class="popover"
      style:bottom={popoverPositionBottom}
      style:left={popoverPositionLeft}
      style:right={popoverPositionRight}
      style:top={popoverPositionTop}
      style:padding={popoverPadding}
      style:border-radius={popoverBorderRadius}
      style:width={popoverWidth}>
      <slot name="popover" />
    </div>
  {/if}
</div>
