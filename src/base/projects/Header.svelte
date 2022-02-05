<script lang="ts">
  import { navigate } from 'svelte-routing';
  import * as utils from '@app/utils';
  import { ProjectContent, getOid, Source } from '@app/project';
  import type { Tree } from "@app/project";
  import BranchSelector from './BranchSelector.svelte';
  import PeerSelector from './PeerSelector.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let source: Source;
  export let path: string;
  export let tree: Tree;
  export let content: ProjectContent;
  export let revision: string;
  // If peerSelector should be showed.
  export let peerSelector: boolean;

  let { urn, peer, config, project, branches, peers, anchors } = source;

  let dropdownState: { [key: string]: boolean } = { clone: false, seed: false, branch: false, peer: false };
  function toggleDropdown(input: string) {
    Object.keys(dropdownState).map((key: string) => {
      if (input === key) dropdownState[key] = !dropdownState[key];
      else dropdownState[key] = false;
    });
  }

  // Switches between the browser and commit view
  const toggleContent = (input: ProjectContent) => {
    dispatch("routeParamsChange", { content: content === input ? ProjectContent.Tree : input, revision, peer, path });
  };

  const updatePeer = (newPeer: string) => {
    dropdownState.peer = false;
    dispatch("routeParamsChange", { content, revision, peer: newPeer, path });
  };

  const updateRevision = (newRevision: string) => {
    dropdownState.branch = false;
    dispatch("routeParamsChange", { content, revision: newRevision, peer, path });
  };

  $: commit = getOid(project.head, revision, branches);
</script>

<style>
  header {
    font-size: 0.75rem;
    padding: 0 2rem 0 8rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  header > * {
    border-radius: 0.25rem;
    min-width: max-content;
  }
  .anchor {
    display: inline-flex;
  }
  .anchor-widget {
    display: flex;
    padding: 0.5rem 0.75rem;
    border-radius: inherit;
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-background);
    cursor: pointer;
  }
  .anchor-widget.not-allowed {
    cursor: not-allowed;
  }
  .anchor-widget.not-anchored {
    color: var(--color-foreground-faded);
    background-color: var(--color-foreground-background);
  }
  .anchor-label {
    font-family: var(--font-family-monospace);
    margin-right: 0.5rem;
  }
  .anchor-label:last-child {
    margin-right: 0;
  }
  .anchor-latest {
    cursor: default;
  }

  .seed {
    cursor: pointer;
    border-radius: inherit;
  }
  .seed:hover {
    background-color: var(--color-foreground-background-lighter);
  }

  .clone {
    color: var(--color-primary);
    background-color: var(--color-primary-background);
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
    user-select: none;
  }
  .clone:hoverr {
    background-color: var(--color-primary-background-lighter);
  }
  .commit-count {
    cursor: pointer;
    user-select: none;
  }
  .commit-count:hover {
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
  .clone-dropdown.clone-dropdown-visible {
    display: block;
  }
  .clone-dropdown input {
    color: var(--color-primary);
    background: var(--color-primary-background);
  }
  .dropdown input {
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
    padding: 0.5rem;
    border: none;
    outline: none;
    width: 24rem;
    text-overflow: ellipsis !important;
    border-radius: 0.25rem;
  }
  .dropdown label {
    display: block;
    color: var(--color-foreground-faded);
    padding: 0.5rem 0.5rem 0 0.25rem;
    font-size: 0.75rem;
  }

  .stat {
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    height: 2.125rem;
    background: var(--color-foreground-background);
  }
  .stat.active {
    color: var(--color-background);
    background: var(--color-foreground-90);
  }

  @media (max-width: 960px) {
    header {
      padding-left: 2rem;
    }
    header {
      margin-bottom: 1.5rem;
    }
  }
  @media (max-width: 720px) {
    .dropdown {
      left: 32px;
      z-index: 10;
    }
  }
</style>

<header>
  {#if peers.length > 0 && peerSelector}
    <PeerSelector {peers} {toggleDropdown} {peer}
      bind:peersDropdown={dropdownState.peer}
      on:peerChanged={(event) => updatePeer(event.detail)} />
  {/if}
  <BranchSelector {branches} {project} {revision} {toggleDropdown}
    bind:branchesDropdown={dropdownState.branch}
    on:revisionChanged={(event) => updateRevision(event.detail)} />
  <div class="anchor">
    {#if anchors}
      <!-- commit is head and latest anchor  -->
      {#if commit == anchors[0] && commit === project.head}
        <span class="anchor-widget anchor-latest">
          <span class="anchor-label" title="{anchors[0]}">latest 🔐</span>
        </span>
      <!-- commit is not head but latest anchor  -->
      {:else if commit == anchors[0] && commit !== project.head}
        <span class="anchor-widget" on:click={() => updateRevision(project.head)}>
          <span class="anchor-label" title="{anchors[0]}">latest 🔐</span>
        </span>
      <!-- commit is not head a stale anchor  -->
      {:else if anchors.includes(commit)}
        <span class="anchor-widget" on:click={() => updateRevision(anchors[0])}>
          <span class="anchor-label" title="{commit}">stale 🔒</span>
        </span>
      <!-- commit is not anchored, could be head or any other commit  -->
      {:else}
        <span class="anchor-widget not-anchored" on:click={() => updateRevision(anchors[0])}>
          <span class="anchor-label">not anchored 🔓</span>
        </span>
      {/if}
    {:else}
      <!-- commit is not head and neither an anchor, and there are no anchors available  -->
      <span class="anchor-widget not-anchored not-allowed">
        <span class="anchor-label">not anchored 🔓</span>
      </span>
    {/if}
  </div>
  {#if config.seed.git.host}
    <span>
      <div class="clone" on:click={() => toggleDropdown("clone")}>
        Clone
      </div>
      <div
        class="dropdown clone-dropdown"
        class:clone-dropdown-visible={dropdownState.clone}
      >
        <input
          readonly
          name="clone-url"
          value="https://{config.seed.git.host}/{utils.parseRadicleId(urn)}.git"
        />
        <label for="clone-url"
          >Use Git to clone this repository from the URL above.</label
        >
      </div>
    </span>
  {/if}
  <span>
    {#if config.seed.api.host}
      <div
        class="stat seed"
        on:click={() => navigate(`/seeds/${config.seed.api.host}`)}
        title="Project data is fetched from this seed"
      >
        <span>{config.seed.api.host}</span>
      </div>
    {/if}
  </span>
  <div class="stat commit-count" class:active={content == ProjectContent.History} on:click={() => toggleContent(ProjectContent.History)}>
    <strong>{tree.stats.commits}</strong> commit(s)
  </div>
  <div class="stat">
    <strong>{tree.stats.contributors}</strong> contributor(s)
  </div>
</header>
