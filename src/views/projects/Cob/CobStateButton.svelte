<script lang="ts" strictEvents>
  import type { Item } from "@app/components/Dropdown.svelte";

  type T = $$Generic;

  import Button from "@app/components/Button.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import { closeFocused } from "@app/components/Floating.svelte";
  import { createEventDispatcher } from "svelte";
  import { isEqual } from "lodash";

  export let state: T;
  export let selectedItem: Item<T>;
  export let items: Item<T>[];

  const dispatch = createEventDispatcher<{
    saveStatus: T;
  }>();

  function switchCaption({ detail: item }: CustomEvent<Item<T>>) {
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
    on:click={() => dispatch("saveStatus", selectedItem.value)}
    style={attachableStyle}>
    {selectedItem.title}
  </Button>
  <Floating>
    <svelte:fragment slot="toggle">
      <button class="toggle">
        <Icon name="chevron-down" />
      </button>
    </svelte:fragment>
    <svelte:fragment slot="modal">
      <Dropdown
        on:select={switchCaption}
        items={items.filter(i => !isEqual(i.value, state))} />
    </svelte:fragment>
  </Floating>
</div>
