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
    Idle,
    Loading,
    Loaded,
  }

  type State =
      { status: Status.Idle }
    | { status: Status.Loading; path: string }
    | { status: Status.Loaded; path: string; blob: proj.Blob };

  export let urn: string;
  export let commit: string;
  export let config: Config;
  export let path: string;
  export let org: Profile | null = null;

  const orgAddress = org?.address;

  // When the component is loaded the first time, the blob is yet to be loaded.
  let state: State = { status: Status.Idle };
  // Whether the clone dropdown is visible.
  let cloneDropdown = false;

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

    navigate(proj.path({ urn, org: orgAddress, commit, path }));
  };

  const fetchTree = async (path: string) => {
    return proj.getTree(urn, commit, path, config);
  };

  // This is reactive to respond to path changes that don't originate from this
  // component, eg. when using the browser's "back" button.
  $: getBlob = loadBlob(path);
  $: getAnchor = orgAddress ? Org.getAnchor(orgAddress, urn, config) : null;
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
    display: inline-block;
    font-family: var(--font-family-monospace);
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    padding: 0.5rem 0.75rem;
  }

  .anchor {
    display: inline-flex;
  }
  .anchor-widget {
    display: flex;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-background);
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
  .clone-dropdown {
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
    font-size: 0.75rem;
    color: var(--color-primary);
    font-family: var(--font-family-monospace);
    padding: 0.5rem;
    background: var(--color-primary-background);
    border: none;
    outline: none;
    width: 24rem;
    text-overflow: ellipsis;
    border-radius: 0.25rem;
  }
  .clone-dropdown label {
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

  @media (max-width: 800px) {
    main > header, .container {
      padding-left: 2rem;
    }
  }
</style>

<main>
  {#await proj.getTree(urn, commit, "/", config)}
    <!-- Loading -->
  {:then tree}
    <header>
      <div class="commit">
        commit {commit}
      </div>
      <div class="anchor">
        {#if orgAddress}
          {#await getAnchor}
            <Loading small margins />
          {:then anchor}
            {#if anchor === commit}
              <span class="anchor-widget">
                <span class="anchor-label">anchored 🔒</span>
              </span>
            {:else}
              <span class="anchor-widget not-anchored">
                <span class="anchor-label">not anchored 🔓</span>
              </span>
            {/if}
          {/await}
        {/if}
      </div>
      {#if config.seed.host}
        <span>
          <div class="clone" on:click={() => cloneDropdown = !cloneDropdown}>
            Clone ↓
          </div>
          <div class="clone-dropdown" class:clone-dropdown-visible={cloneDropdown}>
            <input readonly name="clone-url" value="https://{config.seed.host}/{utils.parseRadicleId(urn)}"/>
            <label for="clone-url">Use Git to clone this repository from the URL above.</label>
          </div>
        </span>
        <div class="stat" title="Project data is fetched from this seed">
          <span>{config.seed.host}</span>
        </div>
      {/if}
      <div class="stat">
        <strong>{tree.stats.commits}</strong> commit(s)
      </div>
      <div class="stat">
        <strong>{tree.stats.contributors}</strong> contributor(s)
      </div>
    </header>
    <div class="container center-content">
      {#if tree.entries.length}
        <div class="column-left">
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
