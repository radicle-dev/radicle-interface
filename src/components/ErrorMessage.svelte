<script lang="ts">
  import Command from "./Command.svelte";
  import ExternalLink from "./ExternalLink.svelte";
  import Icon from "./Icon.svelte";

  export let message: string;
  export let error: any | undefined = undefined;
</script>

<style>
  .error {
    align-items: center;
    border-radius: inherit;
    display: flex;
    flex-direction: column;
    font-family: var(--font-family-sans-serif);
    font-size: inherit;
    padding: 1rem;
    border-radius: var(--border-radius-small);
    gap: 1rem;
  }

  .help {
    font-size: var(--font-size-small);
    text-align: center;
  }
</style>

<div class="error">
  <Icon name="alert" size="48" />
  {message}
  {#if error}
    <div class="help">
      If you need help resolving this issue, copy the error message
      <br />
      below and send it to us on
      <ExternalLink href={config.supportWebsite}>
        {config.supportWebsite}
      </ExternalLink>
    </div>
    <div style:max-width="25rem">
      <Command
        command={JSON.stringify({
          message: error.message,
          stack: error.stack,
          ...error,
        })}
        fullWidth
        showPrompt={false} />
    </div>
  {/if}
</div>
