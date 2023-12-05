<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let running: boolean = false;
</script>

<style>
  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
</style>

<Popover popoverPositionTop="3rem" popoverPositionRight="0">
  <Button
    slot="toggle"
    let:toggle
    on:click={toggle}
    size="large"
    variant={running ? "naked-toggle-on" : "naked-toggle-off"}>
    <IconSmall name="broadcasting" />
    {#if running}
      Syncing
    {:else}
      Sync
    {/if}
  </Button>

  <div slot="popover" style:width="18rem">
    {#if running}
      <div class="label">
        Use the
        <ExternalLink href="https://radicle.xyz/#try">Radicle CLI</ExternalLink>
        to stop your node.
      </div>
      <Command command="rad node stop" fullWidth />
    {:else}
      <div class="label">
        Use the
        <ExternalLink href="https://radicle.xyz/#try">Radicle CLI</ExternalLink>
        to start your node.
      </div>
      <Command command="rad node start" fullWidth />
    {/if}
  </div>
</Popover>
