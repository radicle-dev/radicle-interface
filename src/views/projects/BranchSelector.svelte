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

  $: showSelector = branches.length > 1;
  $: selectedCommitShortId = utils.formatCommit(selectedCommitId);
</script>

<style>
  .commit {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-monospace);
  }
  .commit .branch {
    padding: 0.5rem 0.75rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-2);
    border-radius: var(--border-radius-small) 0 0 var(--border-radius-small);
  }
  .commit .branch.not-allowed {
    cursor: not-allowed;
  }
  .branch:hover:not(.not-allowed) {
    background-color: var(--color-foreground-2);
  }
  .commit .hash {
    display: inline-block;
    height: 2rem;
    line-height: initial;
    color: var(--color-secondary);
    background-color: var(--color-secondary-1);
    padding: 0.5rem 0.75rem;
    border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
  }
  .commit .hash.unlabeled {
    border-radius: var(--border-radius-small);
  }
  .stat {
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    height: 2rem;
    line-height: initial;
    background: var(--color-foreground-1);
  }
</style>

<div class="commit" title="Current branch">
  <!-- Check for branches listing feature -->
  {#if branches.length > 0}
    {#if selectedBranch}
      <Floating disabled={!showSelector}>
        <div
          slot="toggle"
          title="Change branch"
          class="stat branch"
          class:not-allowed={!showSelector}>
          {selectedBranch}
        </div>
        <svelte:fragment slot="modal">
          <Dropdown items={branches}>
            <svelte:fragment slot="item" let:item>
              <Link route={item.route} on:afterNavigate={() => closeFocused()}>
                <DropdownItem
                  selected={item.name === selectedBranch}
                  size="tiny">
                  {item.name}
                </DropdownItem>
              </Link>
            </svelte:fragment>
          </Dropdown>
        </svelte:fragment>
      </Floating>
      <div class="hash layout-desktop">
        {selectedCommitShortId}
      </div>
    {:else}
      <div class="unlabeled hash layout-desktop">
        {selectedCommitId}
      </div>
    {/if}
    <div class="hash layout-mobile">
      {selectedCommitShortId}
    </div>
    <!-- If there is no branch listing available, show default branch name if commit is head and else show entire commit -->
  {:else if selectedBranch}
    <div class="stat branch not-allowed">
      {selectedBranch}
    </div>
    <div class="hash">
      {selectedCommitShortId}
    </div>
  {:else}
    <div class="unlabeled hash layout-desktop">
      {selectedCommitId}
    </div>
    <div class="hash layout-mobile">
      {selectedCommitShortId}
    </div>
  {/if}
</div>
