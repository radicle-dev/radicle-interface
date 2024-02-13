<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
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
  <Button slot="toggle" let:toggle on:click={toggle} variant={"naked-toggle"}>
    {#if running}
      <IconSmall name="online" />
      Online
    {:else}
      <IconSmall name="offline" />
      Offline
    {/if}
  </Button>

  <div slot="popover" style:width="18rem">
    {#if running}
      <div class="label">
        Your node is running and syncing with the network.
      </div>
      <div class="label">
        Shut down your node if you want to stop sharing and receiving updates.
      </div>
      <Command command="rad node stop" fullWidth />
    {:else}
      <div class="label">Your node is not running.</div>
      <div class="label">
        Start your node to seed, clone or share your changes.
      </div>
      <Command command="rad node start" fullWidth />
    {/if}
  </div>
</Popover>
