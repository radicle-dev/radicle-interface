<script lang="ts">
  import type { ComponentProps } from "svelte";

  import { closeFocused } from "@app/components/Popover.svelte";
  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";

  const stateOptions: {
    value: typeof value;
    title: string;
    description: string;
    iconName: ComponentProps<IconSmall>["name"];
  }[] = [
    {
      value: "all",
      title: "All projects",
      description: "Show all projects you’re seeding with your local node.",
      iconName: "globe",
    },
    {
      value: "delegating",
      title: "Delegate only",
      description: "Show only projects that you’re seeding and a delegate of.",
      iconName: "badge",
    },
  ];

  export let value: "all" | "delegating" = "all";
  export let disabled = false;

  let expanded = false;
</script>

<style>
  .popover-content {
    width: 20rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .label {
    display: flex;
    white-space: initial;
  }

  .label .text > * {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .dim {
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
    {disabled}
    variant="outline"
    let:toggle
    slot="toggle"
    on:click={toggle}>
    {#if value === "all"}
      <IconSmall name="globe" />
      All projects
    {:else}
      <IconSmall name="badge" />
      Only delegating
    {/if}
    <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
  </Button>

  <div class="popover-content" slot="popover">
    <DropdownList items={stateOptions}>
      <DropdownListItem
        on:click={() => {
          value = item.value;
          closeFocused();
        }}
        slot="item"
        let:item
        selected={item.value === value}>
        <div class="label">
          <div class="text txt-small">
            <span class="txt-bold">
              <IconSmall name={item.iconName} />{item.title}
            </span>
            <span class="dim">{item.description}</span>
          </div>
        </div>
      </DropdownListItem>
    </DropdownList>
  </div>
</Popover>
