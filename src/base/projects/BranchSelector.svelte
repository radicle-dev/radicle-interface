<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ProjectInfo, Branches, getOid } from "@app/project";
  import { formatCommit } from "@app/utils";
  import Dropdown from "@app/Dropdown.svelte";

  export let branches: Branches;
  export let project: ProjectInfo;
  export let revision: string;
  export let toggleDropdown: (input: string) => void;
  export let branchesDropdown = false;

  const dispatch = createEventDispatcher();
  const switchBranch = (name: string) => {
    dispatch("branchChanged", name);
  };

  let branchLabel: string | null = null;

  $: branchList = Object.keys(branches).sort();
  $: showSelector = branchList.length > 1;
  $: head = branches[project.defaultBranch];
  $: commit = getOid(revision, branches) || head;
  $: if (commit == head) {
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
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    border-radius: 0.25rem 0 0 0.25rem;
  }
  .commit .branch.not-allowed {
    cursor: not-allowed;
  }
  .branch:hover:not(.not-allowed) {
    background-color: var(--color-foreground-background-lighter);
  }
  .commit .hash {
    display: inline-block;
    color: var(--color-secondary);
    background-color: var(--color-secondary-background-darker);
    padding: 0.5rem 0.75rem;
    border-radius: 0 0.25rem 0.25rem 0;
  }
  .commit .hash.unlabeled {
    border-radius: 0.25rem;
  }
  .stat {
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    background: var(--color-foreground-background);
  }
</style>

<div class="commit">
  <!-- Check for branches listing feature -->
  {#if branchList.length > 0}
    {#if branchLabel}
      <span>
        <div
          class="stat branch"
          class:not-allowed={!showSelector}
          on:click={() => showSelector && toggleDropdown("branch")}
        >
          {branchLabel}
        </div>
        <Dropdown
          items={branchList}
          visible={branchesDropdown}
          on:select={(e) => switchBranch(e.detail)} />
      </span>
      <div class="hash desktop">
        {formatCommit(commit)}
      </div>
    {:else}
      <div class="unlabeled hash desktop">
        {commit}
      </div>
    {/if}
    <div class="hash mobile">
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
    <div class="unlabeled hash desktop">
      {commit}
    </div>
    <div class="hash mobile">
      {formatCommit(commit)}
    </div>
  {/if}
</div>
