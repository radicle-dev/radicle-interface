<script lang="ts" context="module">
  import { writable } from "svelte/store";
  const focused = writable<HTMLDivElement | undefined>(undefined);

  export function closeFocused() {
    focused.set(undefined);
  }
</script>

<script lang="ts">
  export let disabled = false;
  export let overlay = false;

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

<style>
  .overlay {
    background-color: #00000075;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .toggle {
    user-select: none;
  }
</style>

<svelte:window on:click={clickOutside} />

<div bind:this={thisComponent}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    on:click={toggle}
    class="toggle"
    style:cursor={disabled ? "not-allowed" : "pointer"}>
    <slot name="toggle" />
  </div>

  {#if expanded}
    {#if overlay}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="overlay" on:click={toggle} />
    {/if}
    <slot name="modal" />
  {/if}
</div>
