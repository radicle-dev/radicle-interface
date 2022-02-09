<script lang="ts">
  import { navigate } from 'svelte-routing';
  import * as utils from '@app/utils';
  import { ProjectContent, getOid, Source } from '@app/project';
  import AnchorBadge from '@app/base/profiles/AnchorBadge.svelte';
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

  let { urn, peer, project, branches, peers, seed, anchors } = source;

  let dropdownState: { [key: string]: boolean } = { clone: false, seed: false, branch: false, peer: false };
  function toggleDropdown(input: string) {
    Object.keys(dropdownState).map((key: string) => {
      if (input === key) dropdownState[key] = !dropdownState[key];
      else dropdownState[key] = false;
    });
  }

  // Switches between the browser and commit view
  const toggleContent = (input: ProjectContent) => {
    dispatch("routeParamsChange", { urn, content: content === input ? ProjectContent.Tree : input, revision, peer, path });
  };

  const updatePeer = (newPeer: string) => {
    dropdownState.peer = false;
    dispatch("routeParamsChange", { urn, content, revision, peer: newPeer, path });
  };

  const updateRevision = (newRevision: string) => {
    dropdownState.branch = false;
    dispatch("routeParamsChange", { urn, content, revision: newRevision, peer, path });
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
    <AnchorBadge {commit} {anchors}
      head={project.head} on:click={(event) => updateRevision(event.detail)} />
  </div>
  {#if seed.git.host}
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
          value="https://{seed.git.host}/{utils.parseRadicleId(urn)}.git"
        />
        <label for="clone-url"
          >Use Git to clone this repository from the URL above.</label
        >
      </div>
    </span>
  {/if}
  <span>
    {#if seed.api.host}
      <div
        class="stat seed"
        on:click={() => navigate(`/seeds/${seed.api.host}`)}
        title="Project data is fetched from this seed"
      >
        <span>{seed.api.host}</span>
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
