<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let projectId: string;
  export let seedCount: number;
  export let seeding: boolean;

  $: buttonTitle = seeding ? "Seeding" : "Seed";
</script>

<style>
  .seed-label {
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
    variant={seeding ? "secondary-toggle-on" : "secondary-toggle-off"}>
    <IconSmall name="network" />
    <span>
      {buttonTitle}
      <span style:font-weight="var(--font-weight-regular)">
        {seedCount}
      </span>
    </span>
  </Button>

  <div slot="popover" style:width={seeding ? "19.5rem" : "30.5rem"}>
    <div class="seed-label">
      Use the <ExternalLink href="https://radicle.xyz/#try">
        Radicle CLI
      </ExternalLink>
      to {seeding ? "stop seeding" : "seed"} this project.
      {#if !seeding}
        <br />
        <br />
        The
        <code>seed</code>
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
    <Command command={`rad seed ${projectId} ${seeding ? "--delete" : ""}`} />
  </div>
</Popover>
