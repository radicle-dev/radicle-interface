<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ProjectInfo, Branches } from "@app/project";
  import { getOid } from "@app/project";
  import { formatCommit } from "@app/utils";
  import Dropdown from "@app/Dropdown.svelte";
  import Floating from "@app/Floating.svelte";

  export let branches: Branches;
  export let project: ProjectInfo;
  export let revision: string;

  const dispatch = createEventDispatcher();
  const switchBranch = (name: string) => {
    dispatch("branchChanged", name);
  };

  let branchLabel: string | null = null;

  $: branchList = Object.keys(branches)
    .sort()
    .map(b => ({ key: b, value: b, title: `Switch to ${b}`, badge: null }));
  $: showSelector = branchList.length > 1;
  $: head = project.head ?? branches[project.defaultBranch];
  $: commit = getOid(revision, branches) || head;
  $: if (commit === head) {
    branchLabel = project.defaultBranch;
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

<div class="commit" title="Switch branches">
  <!-- Check for branches listing feature -->
  {#if branchList.length > 0}
    {#if branchLabel}
      <Floating disabled={!showSelector}>
        <div
          slot="toggle"
          class="stat branch"
          class:not-allowed={!showSelector}>
          {branchLabel}
        </div>
        <svelte:fragment slot="modal">
          <Dropdown
            items={branchList}
            selected={branchLabel}
            on:select={e => switchBranch(e.detail)} />
        </svelte:fragment>
      </Floating>
      <div class="hash layout-desktop">
        {formatCommit(commit)}
      </div>
    {:else}
      <div class="unlabeled hash layout-desktop">
        {commit}
      </div>
    {/if}
    <div class="hash layout-mobile">
      {formatCommit(commit)}
    </div>
    <!-- If there is no branch listing available, show default branch name if commit is head and else show entire commit -->
  {:else if commit === head}
    <div class="stat branch not-allowed">
      {project.defaultBranch}
    </div>
    <div class="hash">
      {formatCommit(commit)}
    </div>
  {:else}
    <div class="unlabeled hash layout-desktop">
      {commit}
    </div>
    <div class="hash layout-mobile">
      {formatCommit(commit)}
    </div>
  {/if}
</div>
