<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let projectId: string;
  export let seedCount: number;
  export let disabled: boolean = false;
</script>

<style>
  .seed-label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
  .title-counter {
    display: flex;
    gap: 0.5rem;
  }
  .counter {
    font-weight: var(--font-weight-regular);
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-fill-ghost-hover);
    border: 1px solid var(--color-border-secondary-counter);
    color: var(--color-foreground-contrast);
    padding: 0 0.25rem;
  }
  .not-seeding {
    background-color: var(--color-fill-secondary-counter);
    color: var(--color-foreground-match-background);
  }
  .disabled {
    background-color: var(--color-fill-float-hover);
    color: var(--color-foreground-disabled);
  }
</style>

<Popover popoverPositionTop="2.5rem" popoverPositionRight="0">
  <Button
    slot="toggle"
    {disabled}
    let:toggle
    on:click={() => {
      toggle();
    }}
    variant="secondary-toggle-off">
    <Icon name="seedling" />
    <span class="title-counter">
      <span class="global-hide-on-mobile-down">Seed</span>
      <span
        class="counter not-seeding"
        class:disabled
        style:font-weight="var(--font-weight-regular)">
        {seedCount}
      </span>
    </span>
  </Button>

  <div slot="popover" style:width="auto">
    <span class="seed-label">
      Use the <ExternalLink href="https://radicle.xyz">
        Radicle CLI
      </ExternalLink> to start seeding this repository.
    </span>
    <Command command={`rad seed ${projectId}`} />
  </div>
</Popover>
