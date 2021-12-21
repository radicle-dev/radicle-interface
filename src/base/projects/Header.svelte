<script lang="ts">
  import type { Config } from '@app/config';
  import * as utils from '@app/utils';
  import Loading from '@app/Loading.svelte';
  import { ethers } from "ethers";
  import type { Info, Tree } from '@app/project';
  import { ProjectContent } from "@app/project";
  import type { Profile } from '@app/profile';

  export let config: Config;
  export let anchors: string | null = null;
  export let urn: string;
  export let commit: string;
  export let project: Info;
  export let profile: Profile | null = null;
  export let tree: Tree;
  export let content: ProjectContent;

  // Whether the clone dropdown is visible.
  let cloneDropdown = false;
  // Whether the seed dropdown is visible.
  let seedDropdown = false;

  // Switches between the browser and commit view
  const switchContent = () => {
    content = content == ProjectContent.Browser ? ProjectContent.Commits : ProjectContent.Browser;
  };

  const GetAllAnchors = `
    query GetAllAnchors($project: Bytes!, $org: ID!) {
      anchors(orderBy: timestamp, orderDirection: desc, where: { objectId: $project, org: $org }) {
        multihash
        timestamp
      }
    }
  `;

  interface AnchorObject {
    timestamp: number;
    multihash: string;
  }

  async function getAllAnchors(anchors: string | null, urn: string): Promise<string[] | null> {
    if (! anchors) {
      return null;
    }
    const unpadded = utils.decodeRadicleId(urn);
    const id = ethers.utils.hexZeroPad(unpadded, 32);
    const allAnchors = await utils.querySubgraph(config.orgs.subgraph, GetAllAnchors, { project: id, org: anchors });
    console.log(allAnchors);
    return allAnchors.anchors
      .map((anchor: AnchorObject) => utils.formatProjectHash(ethers.utils.arrayify(anchor.multihash)));
  }

  $: getAnchor = anchors ? getAllAnchors(anchors, urn) : null;
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

  .commit {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-monospace);
  }
  .commit .branch {
    padding: 0.5rem 0.75rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    border-radius: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .commit .hash {
    display: inline-block;
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    padding: 0.5rem 0.75rem;
    border-radius: inherit;
  }
  .branch + .hash {
    background-color: var(--color-secondary-background-darker);
    border-radius: inherit;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
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
  .seed-dropdown input {
    color: var(--color-foreground-90);
    background: var(--color-foreground-background-lighter);
  }
  .seed-dropdown.seed-dropdown-visible {
    display: block;
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
    background: var(--color-foreground-background);
  }
  .stat.active {
    color: var(--color-background);
    background: var(--color-foreground-90);
  }

  .error {
    color: var(--color-negative);
    cursor: not-allowed;
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
  <div class="commit">
    {#if commit === project.head}
      <div class="branch">
        {project.meta.defaultBranch}
      </div>
      <div class="hash">
        {utils.formatCommit(commit)}
      </div>
    {:else}
      <div class="hash desktop">
        {commit}
      </div>
      <div class="hash mobile">
        {utils.formatCommit(commit)}
      </div>
    {/if}
  </div>
  <div class="anchor">
    {#if anchors}
      {#await getAnchor}
        <Loading small margins />
      {:then anchor}
        {#if anchor}
          <!-- commit is head and latest anchor  -->
          {#if commit == anchor[0] && commit === project.head}
            <span class="anchor-widget anchor-latest">
              <span class="anchor-label" title="{anchors}">latest 🔐</span>
            </span>
          <!-- commit is not head but latest anchor  -->
          {:else if commit == anchor[0] && commit !== project.head}
            <span class="anchor-widget" on:click={() => commit = project.head}>
              <span class="anchor-label" title="{anchors}">latest 🔐</span>
            </span>
          <!-- commit is not head a stale anchor  -->
          {:else if anchor?.includes(commit)}
            <span class="anchor-widget" on:click={() => commit = anchor[0]}>
              <span class="anchor-label" title="{anchors}">stale 🔒</span>
            </span>
          <!-- commit is not anchored, could be head or any other commit  -->
          {:else}
            <span class="anchor-widget not-anchored" on:click={() => commit = anchor[0]}>
              <span class="anchor-label">not anchored 🔓</span>
            </span>
          {/if}
        {:else}
          <!-- commit is not head and neither an anchor, and there are no anchors available  -->
          <span class="anchor-widget not-anchored not-allowed">
            <span class="anchor-label">not anchored 🔓</span>
          </span>
        {/if}
      {:catch}
        <span class="anchor-widget error" title="Not able to fetch anchor from subgraph">
          <span class="anchor-label">❌</span>
        </span>
      {/await}
    {/if}
  </div>
  {#if config.seed.git.host}
    <span>
      <div class="clone" on:click={() => (cloneDropdown = !cloneDropdown)}>
        Clone
      </div>
      <div
        class="dropdown clone-dropdown"
        class:clone-dropdown-visible={cloneDropdown}
      >
        <input
          readonly
          name="clone-url"
          value="https://{config.seed.git.host}/{utils.parseRadicleId(urn)}"
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
        on:click={() => (seedDropdown = !seedDropdown)}
        title="Project data is fetched from this seed"
      >
        <span>{config.seed.api.host}</span>
      </div>
    {/if}
    <div
      class="dropdown seed-dropdown"
      class:seed-dropdown-visible={seedDropdown}
    >
      {#if config.seed.link.id && config.seed.link.host}
        <input
          readonly
          name="clone-url"
          value={utils.formatSeedAddress(
            config.seed.link.id,
            config.seed.link.host,
            config
          )}
        />
        <label for="seed-url">Bootstrap your Radicle node with this seed.</label
        >
      {:else if profile}
        <label for="#">Seed ID is not set for {profile.name}.</label>
      {/if}
    </div>
  </span>
  <div class="stat commit-count" class:active={content == ProjectContent.Commits} on:click={switchContent}>
    <strong>{tree.stats.commits}</strong> commit(s)
  </div>
  <div class="stat">
    <strong>{tree.stats.contributors}</strong> contributor(s)
  </div>
</header>
