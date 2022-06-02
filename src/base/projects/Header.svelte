<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { navigate } from 'svelte-routing';
  import * as utils from '@app/utils';
  import { Browser, ProjectContent, Project } from '@app/project';
  import AnchorBadge from '@app/base/profiles/AnchorBadge.svelte';
  import BranchSelector from '@app/base/projects/BranchSelector.svelte';
  import PeerSelector from '@app/base/projects/PeerSelector.svelte';
  import type { Tree } from "@app/project";
  import Input from "@app/Input.svelte";

  export let project: Project;
  export let tree: Tree;
  export let commit: string;
  export let browserStore: Writable<Browser>;

  let { urn, peers, branches, seed, anchors } = project;

  $: browser = $browserStore;
  $: revision = browser.revision || commit;
  $: content = browser.content;

  let dropdownState: { [key: string]: boolean } = { clone: false, seed: false, branch: false, peer: false };
  function toggleDropdown(input: string) {
    Object.keys(dropdownState).map((key: string) => {
      if (input === key) dropdownState[key] = !dropdownState[key];
      else dropdownState[key] = false;
    });
  }

  // Switches between the browser and commit view.
  const toggleContent = (input: ProjectContent) => {
    project.navigateTo({
      content: content === input ? ProjectContent.Tree : input
    });
  };

  const updatePeer = (peer: string) => {
    dropdownState.peer = false;
    project.navigateTo({ peer, revision: null });
  };

  const updateRevision = (revision: string) => {
    dropdownState.branch = false;
    project.navigateTo({ revision });
  };
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
    color: var(--color-yellow);
    background-color: var(--color-yellow-background);
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
    user-select: none;
  }
  .clone:hover {
    background-color: var(--color-yellow-background-lighter);
  }
  .commit-count {
    cursor: pointer;
    user-select: none;
  }
  .commit-count:hover {
    background-color: var(--color-foreground-background-lighter);
  }
  .dropdown {
    padding: 1rem;
    display: none;
  }
  .clone-dropdown {
    width: 24rem;
  }
  .clone-dropdown.clone-dropdown-visible {
    position: absolute;
    display: block;
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
      width: auto;
      left: 2rem;
      right: 2rem;
      z-index: 10;
    }
  }
</style>

<header>
  {#if peers.length > 0}
    <PeerSelector {peers} {toggleDropdown} peer={browser.peer}
      bind:peersDropdown={dropdownState.peer}
      on:peerChanged={(event) => updatePeer(event.detail)} />
  {/if}

  <BranchSelector {branches} {project} {revision} {toggleDropdown}
    bind:branchesDropdown={dropdownState.branch}
    on:branchChanged={(event) => updateRevision(event.detail)} />

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
        <Input
          name="rad-clone-url"
          value="rad clone rad://{seed.git.host}/{utils.parseRadicleId(urn)}"
          class="yellow"
          clipboard
        />
        <label for="rad-clone-url">
          Use the <a target="_blank" href="https://radicle.network/get-started.html" class="link">Radicle CLI</a> to clone this project.
        </label>
        <br />
        <Input
          name="git-clone-url"
          value="https://{seed.git.host}/{utils.parseRadicleId(urn)}.git"
          class="yellow"
          clipboard
        />
        <label for="git-clone-url">Use Git to clone this repository from the URL above.</label>
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
  <div class="stat contributor-count">
    <strong>{tree.stats.contributors}</strong> contributor(s)
  </div>
</header>
