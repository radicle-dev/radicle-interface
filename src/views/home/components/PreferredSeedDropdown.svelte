<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import {
    preferredSeeds as preferredSeedsStore,
    selectPreferredSeed,
  } from "@app/lib/seeds";
  import { closeFocused } from "@app/components/Popover.svelte";

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
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  popoverPositionLeft="-0.25rem"
  popoverPadding="0.25rem"
  popoverBorderRadius="var(--border-radius-small)">
  <Button
    variant="outline"
    slot="toggle"
    let:toggle
    on:click={toggle}
    title="Change peer"
    {disabled}>
    <IconSmall name="seedling" />
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
              closeFocused();
            }}
            slot="item"
            selected={item.hostname === preferredSeed.hostname}>
            <div class="label">
              <IconSmall name="seedling" />
              {item.hostname}
            </div>
          </DropdownListItem>
        </DropdownList>
      {/if}
    </div>
    <div class="divider" />
    <div class="add-seed-node-instructions txt-small">
      <div class="" style:font-weight="bold">Add a different seed node</div>
      <div class="">
        Update preferred seeds in your Radicle config and restart httpd.
      </div>
      <Command fullWidth command="rad config edit" />
    </div>
  </svelte:fragment>
</Popover>
