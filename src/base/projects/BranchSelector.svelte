<script lang="ts">
  import { Info, getOid } from "@app/project";
  import { formatCommit, isOid } from "@app/utils";
  import { createEventDispatcher } from "svelte";

  export let branches: [string, string][];
  export let project: Info;
  export let revision: string;
  export let toggleDropdown: (input: string) => void;
  export let branchesDropdown = false;

  const dispatch = createEventDispatcher();
  const switchBranch = (name: string) => {
    dispatch("revisionChanged", name);
  };
  const showSelector = branches.length > 1;

  // Sort branches array alphabetically
  const sortBranches = ([firstBranchName,]: [string, string], [secondBranchName,]: [string, string]) => {
    if (firstBranchName < secondBranchName) return -1;
    if (firstBranchName > secondBranchName) return 1;
    return 0;
  };

  let branchLabel: string;
  branches = branches.sort(sortBranches);

  $: commit = getOid(project.head, revision, branches);
  $: isLabel = commit == project.head || !isOid(revision);
  $: if (commit == project.head) {
    branchLabel = project.meta.defaultBranch;
  } else if (!isOid(revision)) {
    branchLabel = revision;
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
    border-radius: inherit;
  }
  .item {
    cursor: pointer;
    padding: 0.3rem;
  }
  .item:hover {
    background-color: var(--color-foreground-background-lighter);
  }
  .dropdown {
    background-color: var(--color-foreground-background);
    padding: 1rem;
    margin-top: 0.5rem;
    border-radius: 0.25rem;
    display: none;
    position: absolute;
  }
  .hidden {
    display: none;
  }
  .pointer {
    cursor: pointer;
  }
  .branch-dropdown.branch-dropdown-without-label {
    margin-top: 1.6rem;
  }
  .branch-dropdown.branch-dropdown-visible {
    display: block;
  }
  .stat {
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    background: var(--color-foreground-background);
  }
  @media (max-width: 720px) {
    .dropdown {
      left: 32px;
      z-index: 10;
    }
  }
</style>

<div class="commit">
  <!-- Check for branches listing feature -->
  {#if branches.length > 0}
    <span>
      <div
        class="stat branch"
        class:not-allowed={!showSelector}
        class:hidden={!isLabel}
        on:click={() => showSelector && toggleDropdown("branch")}
      >
        {branchLabel}
      </div>
      <div
        class="dropdown branch-dropdown"
        class:branch-dropdown-without-label={!isLabel}
        class:branch-dropdown-visible={branchesDropdown}
      >
        {#each branches as [name,]}
          <div class="item" on:click={() => switchBranch(name)}>{name}</div>
        {/each}
      </div>
    </span>
    {#if isLabel}
      <div class="hash">
        {formatCommit(commit)}
      </div>
    {:else}
      <div class="hash desktop" class:pointer={!isLabel} on:click={() => toggleDropdown("branch")}>
        {commit}
      </div>
      <div class="hash mobile" class:pointer={!isLabel} on:click={() => toggleDropdown("branch")}>
        {formatCommit(commit)}
      </div>
    {/if}
  <!-- If there is no branch listing available, show default branch name if commit is head and else show entire commit -->
  {:else if commit === project.head}
    <div class="stat branch not-allowed">
      {project.meta.defaultBranch}
    </div>
    <div class="hash">
      {formatCommit(commit)}
    </div>
  {:else}
    <div class="hash desktop">
      {commit}
    </div>
    <div class="hash mobile">
      {formatCommit(commit)}
    </div>
  {/if}
</div>
