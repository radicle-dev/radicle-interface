<script lang="ts">
  import Clipboard from "@app/components/Clipboard.svelte";

  export let command: string;
</script>

<style>
  .wrapper {
    display: flex;
  }
  .cmd {
    height: 2rem;
    line-height: 2rem;
    background-color: var(--color-foreground-3);
    border-radius: var(--border-radius-small);
    display: inline-block;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    overflow: hidden;
    padding: 0 2rem 0 0.5rem;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid var(--color-border-hint);
    color: var(--color-foreground-dim);
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
  <div class="cmd">
    {command}
    <div class="clipboard">
      <Clipboard small text={command} />
    </div>
  </div>
</div>
