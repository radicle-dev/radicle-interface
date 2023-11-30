<script lang="ts">
  import IconSmall from "@app/components/IconSmall.svelte";

  import isEqual from "lodash/isEqual";

  import { closeFocused } from "@app/components/Popover.svelte";

  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Button from "@app/components/Button.svelte";

  type CobState = $$Generic;

  export let state: CobState;
  export let selectedItem: [string, CobState];
  export let items: [string, CobState][];
  export let save: (state: CobState) => Promise<void>;

  function switchCaption(item: [string, CobState]) {
    selectedItem = item;
    closeFocused();
  }
</script>

<style>
  .main {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1px;
  }
</style>

<div class="main">
  <Button
    styleBorderRadius="var(--border-radius-tiny) 0 0 var(--border-radius-tiny)"
    variant="gray-white"
    on:click={() => void save(selectedItem[1])}>
    <IconSmall name="patch" />
    {selectedItem[0]}
  </Button>

  <Popover
    popoverPadding="0"
    popoverPositionTop="2.5rem"
    popoverPositionRight="0"
    popoverBorderRadius="var(--border-radius-small)">
    <Button
      slot="toggle"
      let:toggle
      on:click={toggle}
      styleBorderRadius="0 var(--border-radius-tiny) var(--border-radius-tiny) 0"
      stylePadding="0 0.25rem"
      variant="gray-white"
      ariaLabel="stateToggle">
      <Icon name="chevron-down" />
    </Button>
    <div slot="popover">
      <DropdownList items={items.filter(i => !isEqual(i, state))}>
        <svelte:fragment slot="item" let:item>
          <DropdownListItem
            selected={isEqual(item[1], selectedItem[1])}
            on:click={() => switchCaption(item)}>
            <IconSmall name="patch" />
            {item[0]}
          </DropdownListItem>
        </svelte:fragment>
      </DropdownList>
    </div>
  </Popover>
</div>
