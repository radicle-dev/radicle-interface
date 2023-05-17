<script lang="ts">
  import Clipboard from "@app/components/Clipboard.svelte";

  export let command: string;
</script>

<style>
  .wrapper {
    display: flex;
  }
  .cmd {
    background-color: var(--color-foreground-3);
    border-radius: var(--border-radius-small);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    padding: 2px 0.5rem;
    display: inline;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>

<div class="wrapper">
  <div class="cmd">{command}</div>
  <Clipboard text={command} small />
</div>
