<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type { ErrorParam } from "@app/lib/router/definitions";

  import config from "@app/lib/config";
  import Command from "./Command.svelte";
  import ExternalLink from "./ExternalLink.svelte";
  import IconLarge from "./IconLarge.svelte";

  export let title: string;
  export let description: string;
  export let error: ErrorParam = undefined;
  export let icon: ComponentProps<IconLarge>["name"] = "alert";
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
  .label {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    max-width: 36rem;
  }
  .error :global(code) {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-tiny);
    padding: 0.125rem 0.25rem;
  }

  .help {
    font-size: var(--font-size-small);
    text-align: center;
  }
  .command {
    max-width: 25rem;
  }
  @media (max-width: 719.98px) {
    .command {
      max-width: 20rem;
    }
  }
</style>

<div class="error">
  <IconLarge name={icon} />
  <div class="txt-medium txt-bold">
    {title}
  </div>
  <!-- This @html is secure since we don't allow user input -->
  <div class="label">{@html description}</div>
  {#if error}
    <div class="help">
      If you need help resolving this issue, copy the error message
      <br class="global-hide-on-mobile-down" />
      below and send it to us on
      <ExternalLink href={config.supportWebsite}>
        {config.supportWebsite}
      </ExternalLink>
    </div>
    <div class="command">
      <Command
        command={JSON.stringify(error, Object.getOwnPropertyNames(error))}
        fullWidth
        showPrompt={false} />
    </div>
  {/if}
</div>
