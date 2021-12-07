<script lang="ts">
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import type { Profile } from '@app/profile';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import { Org } from '@app/base/orgs/Org';
  import * as utils from '@app/utils';

  import Tree from './Tree.svelte';
  import Blob from './Blob.svelte';
  import Readme from './Readme.svelte';

  enum Status {
    Loading,
    Loaded,
  }

  type State = { status: Status.Loading; path: string }
    | { status: Status.Loaded; path: string; blob: proj.Blob };

  export let urn: string;
  export let commit: string;
  export let config: Config;
  export let path: string;
  export let profile: Profile | null = null;
  export let anchors: string | null = null;
  export let org: string | null = null;
  export let user: string | null = null;
  export let project: proj.Info;

  // When the component is loaded the first time, the blob is yet to be loaded.
  let state: State = { status: Status.Loading, path };
  // Whether the clone dropdown is visible.
  let cloneDropdown = false;
  // Whether the seed dropdown is visible.
  let seedDropdown = false;
  // Whether the mobile file tree is visible.
  let mobileFileTree = false;

  const loadBlob = async (path: string): Promise<proj.Blob> => {
    if (state.status == Status.Loaded && state.path === path) {
      return state.blob;
    }

    const isMarkdownPath = utils.isMarkdownPath(path);
    const promise = path === "/"
      ? proj.getReadme(urn, commit, config)
      : proj.getBlob(urn, commit, path, { highlight: !isMarkdownPath }, config);

    state = { status: Status.Loading, path };
    state = { status: Status.Loaded, path, blob: await promise };

    return state.blob;
  };

  const onSelect = async ({ detail: path }: { detail: string }) => {
    // Ensure we don't spend any time in a "loading" state. This means
    // the loading spinner won't be shown, and instead the blob will be
    // displayed once loaded.
    const blob = await loadBlob(path);
    getBlob = new Promise(resolve => resolve(blob));

    // Close mobile tree if user navigates to other file
    mobileFileTree = false;
    navigateBrowser(commit, path);
  };

  const navigateBrowser = (commit: string, path?: string) => {
    // Replaces path with current path if none passed.
    if (path === undefined) path = state.path;

    if (org) {
      navigate(proj.path({ urn, org, commit, path }));
    } else if (user) {
      navigate(proj.path({ urn, user, commit, path }));
    } else {
      navigate(proj.path({ urn, commit, path }));
    }
  };

  const fetchTree = async (path: string) => {
    return proj.getTree(urn, commit, path, config);
  };

  const toggleMobileFileTree = () => {
    mobileFileTree = !mobileFileTree;
  };

  // This is reactive to respond to path changes that don't originate from this
  // component, eg. when using the browser's "back" button.
  $: getBlob = loadBlob(path);
  $: getAnchor = anchors ? Org.getAnchor(anchors, urn, config) : null;
  $: loadingPath = state.status == Status.Loading ? state.path : null;
</script>

<style>
  main > header {
    font-size: 0.75rem;
    padding: 0 2rem 0 8rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;

  }
  main > header > * {
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
  .clone:hover {
    background-color: var(--color-primary-background-lighter);
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

  .center-content {
    margin: 0 auto;
  }

  .container {
    display: flex;
    width: inherit;
    margin-bottom: 4rem;
    padding: 0 2rem 0 8rem;
  }

  .column-left {
    display: flex;
    flex-direction: column;
    padding-right: 1rem;
  }

  .column-right {
    display: flex;
    flex-direction: column;
    padding-left: 1rem;
    min-width: var(--content-min-width);
    width: 100%;
  }

  .source-tree {
    overflow-x: hidden;
  }
  .file-not-found {
    text-align: center;
    border-radius: 0.25rem;
    padding-bottom: 2rem;
  }
  .file-not-found header {
    padding: 1rem 0;
    font-weight: bold;
  }
  .file-not-found .icon {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  nav {
    padding: 0 2rem;
  }

  @media (max-width: 800px) {
    main > header, .container {
      padding-left: 2rem;
    }
    main > header {
      margin-bottom: 1.5rem;
    }
  }

  @media (max-width: 720px) {
    button.browse {
      width: 100%;
      border-color: var(--color-secondary-faded);
    }
    .column-right {
      padding: 1rem 0;
      min-width: 0;
    }
    .source-tree {
      padding-top: 1rem;
    }
    .dropdown {
      left: 32px;
      z-index: 10;
    }
    .container {
      flex-direction: column;
    }
    .column-left {
      display: none;
      padding-right: 0;
    }
    .column-left-visible {
      display: block;
    }
  }
</style>

<main>
  {#await proj.getTree(urn, commit, "/", config)}
    <!-- Loading -->
  {:then tree}
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
            {#if anchor === commit}
              {#if commit === project.head}
                <span class="anchor-widget anchor-latest">
                  <span class="anchor-label" title="{anchors}">anchored 🔒</span>
                </span>
              {:else}
                <span class="anchor-widget" on:click={() => navigateBrowser(project.head)}>
                  <span class="anchor-label" title="{anchors}">anchored 🔒</span>
                </span>
              {/if}
            {:else if anchor}
              <span class="anchor-widget not-anchored" on:click={() => navigateBrowser(anchor)}>
                <span class="anchor-label">not anchored 🔓</span>
              </span>
            {:else}
              <span class="anchor-widget not-anchored not-allowed">
                <span class="anchor-label">not anchored 🔓</span>
              </span>
            {/if}
          {/await}
        {/if}
      </div>
      {#if config.seed.git.host}
        <span>
          <div class="clone" on:click={() => cloneDropdown = !cloneDropdown}>
            Clone
          </div>
          <div class="dropdown clone-dropdown" class:clone-dropdown-visible={cloneDropdown}>
            <input readonly name="clone-url" value="https://{config.seed.git.host}/{utils.parseRadicleId(urn)}"/>
            <label for="clone-url">Use Git to clone this repository from the URL above.</label>
          </div>
        </span>
      {/if}
      <span>
        {#if config.seed.api.host}
          <div class="stat seed" on:click={() => seedDropdown = !seedDropdown} title="Project data is fetched from this seed">
            <span>{config.seed.api.host}</span>
          </div>
        {/if}
        <div class="dropdown seed-dropdown" class:seed-dropdown-visible={seedDropdown}>
          {#if config.seed.link.id && config.seed.link.host}
            <input readonly
              name="clone-url"
              value={utils.formatSeedAddress(config.seed.link.id, config.seed.link.host, config)}/>
            <label for="seed-url">Bootstrap your Radicle node with this seed.</label>
          {:else if profile}
            <label for="#">Seed ID is not set for {profile.name}.</label>
          {/if}
        </div>
      </span>
      <div class="stat">
        <strong>{tree.stats.commits}</strong> commit(s)
      </div>
      <div class="stat">
        <strong>{tree.stats.contributors}</strong> contributor(s)
      </div>
    </header>

    <!-- Mobile navigation -->
    <nav class="mobile">
      <button class="small browse secondary center-content" on:click={toggleMobileFileTree}>
        Browse
      </button>
    </nav>

    <div class="container center-content">
      {#if tree.entries.length}
        <div class="column-left" class:column-left-visible={mobileFileTree}>
          <div class="source-tree">
            <Tree {tree} {path} {fetchTree} {loadingPath} on:select={onSelect} />
          </div>
        </div>
        <div class="column-right">
          {#await getBlob}
            <Loading small center />
          {:then blob}
            {#if utils.isMarkdownPath(blob.path)}
              <Readme content={blob.content} />
            {:else}
              <Blob {blob} />
            {/if}
          {:catch}
            <div class="error error-message file-not-found">
              <header>
                <div class="icon">🍂</div>
                {#if path != "/"}
                  <div><code>{path}</code></div>
                {/if}
              </header>
              {#if path == "/"}
                The README could not be loaded.
              {:else}
                This path could not be loaded.
              {/if}
            </div>
          {/await}
        </div>
      {/if}
    </div>
  {:catch err}
    <div class="container center-content">
      <div class="error error-message text-xsmall">
        <!-- TODO: Differentiate between (1) commit doesn't exist and (2) failed
             to fetch - this needs a change to the backend. -->
        API request to <code class="text-xsmall">{err.url}</code> failed
      </div>
    </div>
  {/await}
</main>
