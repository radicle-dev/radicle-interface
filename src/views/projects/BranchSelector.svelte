<script lang="ts" strictEvents>
  import * as utils from "@app/lib/utils";

  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownItem from "@app/components/Dropdown/DropdownItem.svelte";
  import Floating from "@app/components/Floating.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";

  export let branches: Record<string, string>;
  export let projectDefaultBranch: string;
  export let projectHead: string | undefined = undefined;
  export let revision: string;

  let branchLabel: string | null = null;

  $: branchList = Object.keys(branches)
    .sort()
    .map(b => ({ key: b, value: b, title: `Switch to ${b}`, badge: null }));
  $: showSelector = branchList.length > 1;
  $: head = projectHead ?? branches[projectDefaultBranch];
  $: commit = utils.getOid(revision, branches) || head;
  $: if (commit === head) {
    branchLabel = projectDefaultBranch;
  } else if (branches[revision]) {
    branchLabel = revision;
  } else {
    branchLabel = null;
  }
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
  {#if branchList.length > 0}
    {#if branchLabel}
      <Floating disabled={!showSelector}>
        <div
          slot="toggle"
          title="Change branch"
          class="stat branch"
          class:not-allowed={!showSelector}>
          {branchLabel}
        </div>
        <svelte:fragment slot="modal">
          <Dropdown items={branchList}>
            <svelte:fragment slot="item" let:item>
              <ProjectLink projectParams={{ revision: item.value }} on:click>
                <DropdownItem selected={item.value === branchLabel} size="tiny">
                  {item.value}
                </DropdownItem>
              </ProjectLink>
            </svelte:fragment>
          </Dropdown>
        </svelte:fragment>
      </Floating>
      <div class="hash layout-desktop">
        {utils.formatCommit(commit)}
      </div>
    {:else}
      <div class="unlabeled hash layout-desktop">
        {commit}
      </div>
    {/if}
    <div class="hash layout-mobile">
      {utils.formatCommit(commit)}
    </div>
    <!-- If there is no branch listing available, show default branch name if commit is head and else show entire commit -->
  {:else if commit === head}
    <div class="stat branch not-allowed">
      {projectDefaultBranch}
    </div>
    <div class="hash">
      {utils.formatCommit(commit)}
    </div>
  {:else}
    <div class="unlabeled hash layout-desktop">
      {commit}
    </div>
    <div class="hash layout-mobile">
      {utils.formatCommit(commit)}
    </div>
  {/if}
</div>
