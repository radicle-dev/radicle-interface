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
    line-height: initial;

    font-family: var(--font-family-monospace);
    color: var(--color-secondary);
  }
  .branch-name {
    height: 2rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-secondary-2);
    border-radius: var(--border-radius-small) 0 0 var(--border-radius-small);
  }
  .branch-name.not-allowed {
    cursor: not-allowed;
  }
  .branch-name:hover:not(.not-allowed) {
    background-color: var(--color-foreground-2);
  }
  .commit-id {
    height: 2rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-secondary-1);
    border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
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
