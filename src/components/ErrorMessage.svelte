<script lang="ts">
  import Clipboard from "@app/components/Clipboard.svelte";

  export let message: string;
  export let stackTrace: string | undefined = undefined;
</script>

<style>
  .error {
    padding: 1rem;
    font-size: var(--font-size-regular);
    font-family: var(--font-family-sans-serif);
    color: var(--color-negative);
    border-radius: var(--border-radius);
    background-color: var(--color-negative-3);
    display: flex;
    align-items: center;
    width: 100%;
  }
  .stack-trace {
    display: flex;
    align-self: flex-end;
  }
</style>

<div class="error">
  {message}
  {#if stackTrace}
    <div class="stack-trace">
      <Clipboard
        small
        tooltip="Copy error to clipboard"
        text={JSON.stringify({ errorMessage: message, stackTrace }, null, 2)} />
    </div>
  {/if}
</div>
