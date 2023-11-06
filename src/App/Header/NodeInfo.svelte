<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Command from "@app/components/Command.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";

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

<Popover
  popoverPositionTop="3rem"
  popoverPositionRight="-13rem"
  popoverPositionLeft="0">
  <Button
    slot="toggle"
    let:toggle
    on:click={toggle}
    size="large"
    variant={running ? "primary" : "outline"}>
    <IconSmall name="broadcasting" />
    {#if running}
      Syncing
    {:else}
      Sync
    {/if}
  </Button>

  <svelte:fragment slot="popover">
    {#if running}
      <div class="label">
        Use the <a
          target="_blank"
          rel="noreferrer"
          href="https://radicle.xyz/#try"
          class="txt-link txt-bold">
          Radicle CLI
        </a>
        to stop your node.
      </div>
      <Command command="rad node stop" fullWidth />
    {:else}
      <div class="label">
        Use the <a
          target="_blank"
          rel="noreferrer"
          href="https://radicle.xyz/#try"
          class="txt-link txt-bold">
          Radicle CLI
        </a>
        to start your node.
      </div>
      <Command command="rad node start" fullWidth />
    {/if}
  </svelte:fragment>
</Popover>
