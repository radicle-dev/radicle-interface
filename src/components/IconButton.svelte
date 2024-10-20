<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Loading from "./Loading.svelte";

  export let ariaLabel: string | undefined = undefined;
  export let inline: boolean = false;
  export let loading: boolean = false;
  export let title: string | undefined = undefined;
  export let stylePadding: string | undefined = undefined;
  export let disabled: boolean = false;
  export let stopPropagation: boolean = false;

  const dispatch = createEventDispatcher<{ click: MouseEvent }>();
</script>

<style>
  .button {
    user-select: none;
    background-color: transparent;
    border-radius: var(--border-radius-tiny);
    color: var(--color-foreground-dim);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 6px;
    gap: 0.25rem;
    font-size: var(--font-size-small);
  }
  .inline {
    display: inline-flex;
  }
  .button:hover {
    color: var(--color-foreground-contrast);
    background-color: var(--color-fill-ghost);
  }
  .disabled,
  .disabled:hover {
    color: var(--color-fill-counter);
    background-color: unset;
  }
</style>

{#if loading}
  <Loading small noDelay />
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class:disabled
    aria-label={ariaLabel}
    class:inline
    class="button"
    on:click={ev => {
      if (stopPropagation) {
        ev.stopPropagation();
      }
      if (disabled) {
        return;
      }
      dispatch("click", ev);
    }}
    role="button"
    style:padding={stylePadding}
    tabindex="0"
    {title}>
    <slot />
  </div>
{/if}
