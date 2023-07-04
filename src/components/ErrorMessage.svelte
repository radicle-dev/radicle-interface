<script lang="ts">
  import Clipboard from "@app/components/Clipboard.svelte";

  export let message: string;
  export let stackTrace: string | undefined = undefined;
</script>

<style>
  .error {
    align-items: center;
    background-color: var(--color-negative-3);
    border-radius: inherit;
    color: var(--color-negative);
    display: flex;
    font-family: var(--font-family-sans-serif);
    font-size: inherit;
    padding: 1rem;
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
