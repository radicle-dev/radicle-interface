<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";
  import { isEqual } from "lodash";

  import { closeFocused } from "@app/components/Floating.svelte";

  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownItem from "@app/components/Dropdown/DropdownItem.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Button from "@app/components/Button.svelte";

  type CobState = $$Generic;

  export let state: CobState;
  export let selectedItem: [string, CobState];
  export let items: [string, CobState][];

  const dispatch = createEventDispatcher<{
    saveStatus: CobState;
  }>();

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
    border-radius: var(--border-radius-tiny);
    overflow: hidden;
    border: 1px solid transparent;
  }

  .main:hover {
    border: 1px solid var(--color-fill-secondary);
  }
</style>

<div class="main">
  <Button
    square
    variant="none"
    on:click={() => dispatch("saveStatus", selectedItem[1])}>
    {selectedItem[0]}
  </Button>
  <Floating>
    <svelte:fragment slot="toggle">
      <Button square variant="none" ariaLabel="stateToggle">
        <Icon name="chevron-down" />
      </Button>
    </svelte:fragment>
    <svelte:fragment slot="modal">
      <Dropdown items={items.filter(i => !isEqual(i, state))}>
        <svelte:fragment slot="item" let:item>
          <DropdownItem selected={false} on:click={() => switchCaption(item)}>
            {item[0]}
          </DropdownItem>
        </svelte:fragment>
      </Dropdown>
    </svelte:fragment>
  </Floating>
</div>
