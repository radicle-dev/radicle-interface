<script lang="ts" context="module">
  import { writable } from "svelte/store";
  const focused = writable<HTMLDivElement | undefined>(undefined);

  export function closeFocused() {
    focused.set(undefined);
  }
</script>

<script lang="ts">
  export let disabled = false;

  let expanded = false;
  let thisComponent: HTMLDivElement;

  function clickOutside(ev: MouseEvent) {
    if (!$focused?.contains(ev.target as HTMLDivElement)) {
      closeFocused();
    }
  }

  function toggle() {
    if (!disabled) {
      expanded = !expanded;
      if ($focused === thisComponent) {
        closeFocused();
      } else {
        focused.set(thisComponent);
      }
    }
  }

  $: expanded = $focused === thisComponent;
</script>

<svelte:window on:click={clickOutside} />

<div bind:this={thisComponent}>
  <div on:click={toggle}>
    <slot name="toggle" />
  </div>

  {#if expanded}
    <slot name="modal" />
  {/if}
</div>
