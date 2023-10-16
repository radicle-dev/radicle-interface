<script lang="ts">
  import { pluralize } from "@app/lib/pluralize";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
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
</style>

<Popover
  popoverPositionTop="3rem"
  popoverPositionRight="0"
  popoverWidth="26rem">
  <Button
    slot="toggle"
    size="large"
    variant="outline"
    title="Tracked by {trackings} {pluralize('node', trackings)}">
    {#if tracking}
      <IconSmall name="tracking-on" />
    {:else}
      <IconSmall name="tracking-off" />
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

  <svelte:fragment slot="popover">
    <div class="track-label">
      Use the <a
        target="_blank"
        rel="noreferrer"
        href="https://radicle.xyz/#try"
        class="txt-link txt-bold">
        Radicle CLI
      </a>
      to {command} this project.
      <br />
      <br />
      Tracking means subscribing to updates from this repository. It also helps with
      increasing its availability over the Radicle network.
    </div>
    <Command command={`rad ${command} ${projectId}`} />
  </svelte:fragment>
</Popover>
