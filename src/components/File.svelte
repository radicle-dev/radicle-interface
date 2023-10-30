<script lang="ts">
  import { tick } from "svelte";
  import ExpandButton from "./ExpandButton.svelte";

  export let collapsable: boolean = false;
  export let expanded: boolean = true;

  let header: HTMLDivElement;
</script>

<style>
  .header {
    display: flex;
    height: 3rem;
    align-items: center;
    padding: 0 0.5rem 0 1rem;
    border: 1px solid var(--color-border-hint);
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
    background-color: var(--color-background-default);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .collapsed {
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-border-hint);
  }

  .left {
    display: flex;
    gap: 0.5rem;
    margin-right: 1rem;
  }

  .right {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
    overflow: hidden;
  }

  .container {
    position: relative;
    overflow-x: auto;
    border: 1px solid var(--color-border-hint);
    border-top: 0;
    background: var(--color-background-float);
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }

  @media (max-width: 720px) {
    .header,
    .container {
      border-radius: 0;
    }
  }
</style>

<div bind:this={header} class="header" class:collapsed={!expanded}>
  <div class="left">
    {#if collapsable}
      <ExpandButton
        {expanded}
        on:toggle={async () => {
          expanded = !expanded;
          if (!expanded) {
            await tick();
            header.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }} />
    {/if}
    <slot name="left-header" />
  </div>

  <div class="right">
    <slot name="right-header" />
  </div>
</div>

{#if expanded}
  <div class="container">
    <slot />
  </div>
{/if}
