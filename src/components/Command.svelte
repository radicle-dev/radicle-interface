<script lang="ts">
  import { SvelteComponent } from "svelte";

  import Clipboard from "@app/components/Clipboard.svelte";

  export let command: string;

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
    background-color: var(--color-foreground-3);
    border-radius: var(--border-radius-small);
    display: inline-block;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    overflow: hidden;
    padding: 0 2.5rem 0 0.5rem;
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
  .cmd:hover .clipboard {
    background-color: var(--color-fill-ghost-hover);
  }
  .clipboard {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-fill-ghost);
    position: absolute;
    right: 0;
    top: 0;
    width: 2rem;
    height: 100%;
  }
</style>

<div class="wrapper">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="cmd"
    on:click={() => {
      clipboard.copy();
    }}>
    $ {command}
    <div class="clipboard">
      <Clipboard bind:this={clipboard} small text={command} />
    </div>
  </div>
</div>
