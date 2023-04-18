<script lang="ts">
  import Clipboard from "@app/components/Clipboard.svelte";

  export let message: string;
  export let stackTrace: string | undefined = undefined;
</script>

<style>
  .error {
    padding: 1rem;
    color: var(--color-negative);
    border-radius: var(--border-radius);
    background-color: var(--color-negative-3);
    display: flex;
    align-items: center;
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
        tooltip="Copy error to clipboard"
        text={JSON.stringify({ errorMessage: message, stackTrace }, null, 2)} />
    </div>
  {/if}
</div>
