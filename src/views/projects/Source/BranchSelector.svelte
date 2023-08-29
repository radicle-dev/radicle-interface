<script lang="ts">
  import * as utils from "@app/lib/utils";
  import { closeFocused } from "@app/components/Floating.svelte";

  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownItem from "@app/components/Dropdown/DropdownItem.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Link from "@app/components/Link.svelte";
  import type { Route } from "@app/lib/router";

  export let selectedBranch: string | undefined;
  export let selectedCommitId: string;
  export let branches: Array<{ name: string; route: Route }>;

  $: hideDropdown = branches.length <= 1;
  $: selectedCommitShortId = utils.formatCommit(selectedCommitId);
</script>

<style>
  .commit {
    display: flex;
    align-items: center;
    justify-content: center;

    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
  }
  .branch-name {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 0.75rem;
    height: 2rem;
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-small) 0 0 var(--border-radius-small);
    font-weight: var(--font-weight-bold);
  }
  .branch-name.not-allowed {
    cursor: not-allowed;
  }
  .branch-name:hover:not(.not-allowed) {
    background-color: var(--color-fill-ghost-hover);
  }
  .commit-id {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-fill-secondary);
    height: 2rem;
    padding: 0 0.75rem;
    border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
    background-color: var(--color-background-dip);
    border: 1px solid var(--color-border-hint);
    font-weight: var(--font-weight-bold);
  }
  .commit-id.standalone {
    border-radius: var(--border-radius-small);
  }
</style>

<div class="commit" title="Current branch">
  {#if selectedBranch}
    <Floating disabled={hideDropdown}>
      <div
        slot="toggle"
        title="Change branch"
        class="branch-name"
        class:not-allowed={hideDropdown}>
        {selectedBranch}
      </div>
      <Dropdown slot="modal" items={branches}>
        <Link
          slot="item"
          let:item
          route={item.route}
          on:afterNavigate={() => closeFocused()}>
          <DropdownItem selected={item.name === selectedBranch} size="tiny">
            {item.name}
          </DropdownItem>
        </Link>
      </Dropdown>
    </Floating>
    <div class="commit-id">
      {selectedCommitShortId}
    </div>
  {:else}
    <div class="commit-id standalone layout-desktop">
      {selectedCommitId}
    </div>
    <div class="commit-id standalone layout-mobile">
      {selectedCommitShortId}
    </div>
  {/if}
</div>
