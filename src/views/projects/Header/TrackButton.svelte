<script lang="ts">
  import { pluralize } from "@app/lib/pluralize";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let projectId: string;
  export let trackings: number;
  export let tracking: boolean;

  $: buttonTitle = tracking ? "Tracking" : "Track";
  $: command = tracking ? "untrack" : "track";
</script>

<style>
  .track-label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
  code {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-tiny);
    padding: 0.125rem 0.25rem;
  }
</style>

<Popover popoverPositionTop="3rem" popoverPositionRight="0">
  <Button
    slot="toggle"
    let:toggle
    on:click={toggle}
    size="large"
    variant="outline"
    title="Tracked by {trackings} {pluralize('node', trackings)}">
    {#if tracking}
      <div style:color="var(--color-fill-secondary)">
        <IconSmall name="network" />
      </div>
    {:else}
      <div style:color="var(--color-foreground-contrast)">
        <IconSmall name="network" />
      </div>
    {/if}
    <span>
      {buttonTitle}
      <span
        style:color="var(--color-foreground-dim)"
        style:font-weight="var(--font-weight-regular)">
        {trackings}
      </span>
    </span>
  </Button>

  <div slot="popover" style:width={tracking ? "19.5rem" : "30.5rem"}>
    <div class="track-label">
      Use the <ExternalLink href="https://radicle.xyz/#try">
        Radicle CLI
      </ExternalLink>
      to {command} this project.
      {#if command === "track"}
        <br />
        <br />
        The
        <code>track</code>
        command serves a dual purpose:
        <ul style:padding="0 1rem" style:margin-top="0.5rem">
          <li>
            Keeps your local Radicle node in sync with updates from this
            project.
          </li>
          <li>
            Propagates them across the Radicle network to other peers like you.
          </li>
        </ul>
      {/if}
    </div>
    <Command command={`rad ${command} ${projectId}`} />
  </div>
</Popover>
