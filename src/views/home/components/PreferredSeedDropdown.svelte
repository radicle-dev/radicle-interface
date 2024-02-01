<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import {
    prefferedSeeds as preferredSeedsStore,
    selectPreferredSeed,
  } from "@app/lib/seeds";

  import Popover from "@app/components/Popover.svelte";
  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import Command from "@app/components/Command.svelte";

  export let preferredSeed: BaseUrl;
  export let disabled = false;

  $: stateOptions = $preferredSeedsStore?.seeds;

  let expanded = false;
</script>

<style>
  .popover {
    width: 16rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .divider {
    height: 1px;
    width: 100%;
    margin: 0.5rem 0.25rem;
    background-color: var(--color-border-default);
  }

  .add-seed-node-instructions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    color: var(--color-foreground-dim);
  }
</style>

<Popover
  bind:expanded
  popoverPositionTop="2.5rem"
  popoverPositionRight="0"
  popoverPadding="0.25rem"
  popoverBorderRadius="var(--border-radius-small)">
  <Button
    variant="outline"
    slot="toggle"
    let:toggle
    on:click={toggle}
    title="Change peer"
    {disabled}>
    {preferredSeed.hostname}
    <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
  </Button>

  <svelte:fragment slot="popover">
    <div class="popover">
      {#if stateOptions}
        <DropdownList items={stateOptions}>
          <DropdownListItem
            let:item
            on:click={() => {
              selectPreferredSeed(item);
              window.location.reload();
            }}
            slot="item"
            selected={item.hostname === preferredSeed.hostname}>
            <div class="label">
              {item.hostname}
            </div>
          </DropdownListItem>
        </DropdownList>
      {/if}
    </div>
    <div class="divider" />
    <div class="add-seed-node-instructions txt-small">
      <div class="" style:font-weight="bold">Add a different seed node</div>
      <div class="">Update your preferred seeds in your radicle config.</div>
      <Command fullWidth command="rad self --config" />
    </div>
  </svelte:fragment>
</Popover>