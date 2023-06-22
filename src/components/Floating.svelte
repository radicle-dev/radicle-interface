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

  function clickOutside(ev: MouseEvent | TouchEvent) {
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

<style>
  .toggle {
    user-select: none;
  }
</style>

<svelte:window on:click={clickOutside} on:touchstart={clickOutside} />

<div bind:this={thisComponent}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:click={toggle}
    class="toggle"
    style:cursor={disabled ? "not-allowed" : "pointer"}>
    <slot name="toggle" />
  </div>

  {#if expanded}
    <slot name="modal" />
  {/if}
</div>
