<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";
  import { isEqual } from "lodash";

  import { closeFocused } from "@app/components/Floating.svelte";

  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
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
      <DropdownList items={items.filter(i => !isEqual(i, state))}>
        <svelte:fragment slot="item" let:item>
          <DropdownListItem
            selected={false}
            on:click={() => switchCaption(item)}>
            {item[0]}
          </DropdownListItem>
        </svelte:fragment>
      </DropdownList>
    </svelte:fragment>
  </Floating>
</div>
