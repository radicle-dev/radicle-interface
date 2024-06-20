<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let disabled = false;
</script>

<style>
  .popover {
    min-width: 16rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>

<Popover
  popoverPositionTop="2.5rem"
  popoverPositionRight="0"
  popoverBorderRadius="var(--border-radius-small)">
  <Button
    {disabled}
    variant="secondary"
    let:toggle
    slot="toggle"
    on:click={toggle}>
    <IconSmall name="plus" />
    New repository
  </Button>

  <div slot="popover" class="popover txt-small">
    Run the following command within an already-existing Git repository to
    create a new Radicle repository.
    <Command fullWidth command="rad init" />
  </div>
</Popover>
