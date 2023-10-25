<script lang="ts">
  import Loading from "./Loading.svelte";

  export let ariaLabel: string | undefined = undefined;
  export let inline: boolean = false;
  export let loading: boolean = false;
  export let title: string | undefined = undefined;
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
    padding: 2px 4px;
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
</style>

{#if loading}
  <Loading small noDelay />
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    role="button"
    tabindex="0"
    aria-label={ariaLabel}
    {title}
    class="button"
    class:inline
    on:click>
    <slot />
  </div>
{/if}
