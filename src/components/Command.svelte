<script lang="ts">
  import { SvelteComponent } from "svelte";

  import Clipboard from "@app/components/Clipboard.svelte";

  export let command: string;
  export let fullWidth: boolean = false;
  export let showPrompt: boolean = true;

  let clipboard: SvelteComponent;
</script>

<style>
  .wrapper {
    display: flex;
  }
  .cmd {
    cursor: pointer;
    height: 2rem;
    line-height: 2rem;
    border-radius: var(--border-radius-small);
    display: inline-block;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    overflow: hidden;
    padding: 0 2rem 0 0.75rem;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid var(--color-border-hint);
    color: var(--color-foreground-dim);
    user-select: none;
  }
  .cmd:hover {
    border: 1px solid var(--color-border-default);
    color: var(--color-foreground-contrast);
  }
  .clipboard {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0;
    top: 0;
    width: 2rem;
    height: 100%;
  }

  .full-width.wrapper,
  .full-width.cmd {
    width: 100%;
  }
</style>

<div class="wrapper" class:full-width={fullWidth}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    role="button"
    tabindex="0"
    class="cmd"
    class:full-width={fullWidth}
    on:click={() => {
      clipboard.copy();
    }}>
    {#if showPrompt}${/if}
    {command}
    <div class="clipboard">
      <Clipboard bind:this={clipboard} small text={command} />
    </div>
  </div>
</div>
