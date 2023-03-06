<script lang="ts">
  import type { Issue, State } from "@app/lib/issue";

  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownButton from "@app/components/DropdownButton.svelte";
  import { createEventDispatcher } from "svelte";
  import { isEqual } from "lodash";

  export let issue: Issue;

  const dispatch = createEventDispatcher<{ saveStatus: State }>();
  let showStateDropdown = false;

  interface Item {
    key: string;
    title: string;
    value: State;
    badge: null;
  }

  const items: Item[] = [
    {
      key: "Reopen issue",
      title: "Reopen issue",
      value: { status: "open" },
      badge: null,
    },
    {
      key: "Close issue as solved",
      title: "Close issue as solved",
      value: { status: "closed", reason: "solved" },
      badge: null,
    },
    {
      key: "Close issue as other",
      title: "Close issue as other",
      value: { status: "closed", reason: "other" },
      badge: null,
    },
  ];

  function switchCaption({ detail: item }: CustomEvent<any>) {
    showStateDropdown = false;
    selectedItem = item;
  }

  $: selectedItem = issue.state.status === "closed" ? items[0] : items[1];
</script>

<style>
  .main {
    position: relative;
  }
  .dropdown {
    position: absolute;
    right: 11rem;
    top: 2.5rem;
  }
</style>

<div class="main">
  <DropdownButton
    variant="foreground"
    size="small"
    on:toggle={() => (showStateDropdown = !showStateDropdown)}
    on:click={() => dispatch("saveStatus", selectedItem.value)}>
    {selectedItem.key}
  </DropdownButton>
  {#if showStateDropdown}
    <div class="dropdown">
      <Dropdown
        on:select={switchCaption}
        items={items.filter(i => !isEqual(i.value, issue.state))} />
    </div>
  {/if}
</div>
