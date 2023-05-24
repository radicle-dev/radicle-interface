<script lang="ts" strictEvents>
  type T = $$Generic;

  import Button from "@app/components/Button.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownItem from "@app/components/Dropdown/DropdownItem.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";

  import { closeFocused } from "@app/components/Floating.svelte";
  import { createEventDispatcher } from "svelte";
  import { isEqual } from "lodash";

  export let state: T;
  export let selectedItem: [string, T];
  export let items: [string, T][];

  const dispatch = createEventDispatcher<{
    saveStatus: T;
  }>();

  function switchCaption(item: [string, T]) {
    selectedItem = item;
    closeFocused();
  }

  const attachableStyle = `border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;`;
</script>

<style>
  .main {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .toggle {
    cursor: pointer;
    border: 1px solid var(--color-foreground);
    border-radius: var(--border-radius-round);
    border-top-left-radius: 0;
    height: var(--button-small-height);
    background: transparent;
    color: var(--color-foreground);
    border-bottom-left-radius: 0;
    line-height: 1.6rem;
    font-size: var(--font-size-regular);
    padding: 0 0.2rem;
  }
  .toggle:hover {
    background-color: var(--color-foreground);
    color: var(--color-background);
  }
</style>

<div class="main">
  <Button
    variant="foreground"
    size="small"
    on:click={() => dispatch("saveStatus", selectedItem[1])}
    style={attachableStyle}>
    {selectedItem[0]}
  </Button>
  <Floating>
    <svelte:fragment slot="toggle">
      <button class="toggle">
        <Icon name="chevron-down" />
      </button>
    </svelte:fragment>
    <svelte:fragment slot="modal">
      <Dropdown items={items.filter(i => !isEqual(i, state))}>
        <svelte:fragment slot="item" let:item>
          <DropdownItem
            selected={false}
            on:click={() => switchCaption(item)}
            size="small">
            {item[0]}
          </DropdownItem>
        </svelte:fragment>
      </Dropdown>
    </svelte:fragment>
  </Floating>
</div>
