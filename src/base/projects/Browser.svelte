<script lang="ts">
  import { navigate } from 'svelte-routing';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
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

  export let source: proj.Source;
  export let tree: proj.Tree;
  export let locator: string; // eg. "master/README.md"
  export let content: proj.ProjectContent;
  export let revision: string;
  export let path: string;
  export let peer: string;

  let { urn, addressOrName, seed, project, branches } = source;

  // This is reactive to respond to path changes that don't originate from this
  // component, eg. when using the browser's "back" button.
  $: [revision_, path_] = proj.splitPrefixFromPath(locator, branches, project.head);
  // Bind content to file tree to trigger updates in parent components.
  $: content = proj.ProjectContent.Tree;
  $: revision = revision_;
  $: path = path_;

  // When the component is loaded the first time, the blob is yet to be loaded.
  let state: State = { status: Status.Loading, path };
  // Whether the mobile file tree is visible.
  let mobileFileTree = false;

  const loadBlob = async (path: string): Promise<proj.Blob> => {
    if (state.status == Status.Loaded && state.path === path) {
      return state.blob;
    }

    const isMarkdownPath = utils.isMarkdownPath(path);
    const promise = path === "/"
      ? proj.getReadme(urn, commit, source.seed.api)
      : proj.getBlob(urn, commit, path, { highlight: !isMarkdownPath }, source.seed.api);

    state = { status: Status.Loading, path };
    state = { status: Status.Loaded, path, blob: await promise };

    return state.blob;
  };

  const onSelect = async ({ detail: newPath }: { detail: string }) => {
    // Ensure we don't spend any time in a "loading" state. This means
    // the loading spinner won't be shown, and instead the blob will be
    // displayed once loaded.
    const blob = await loadBlob(newPath);
    getBlob = new Promise(resolve => resolve(blob));

    // Close mobile tree if user navigates to other file
    mobileFileTree = false;
    navigateBrowser(revision, newPath);
  };

  const navigateBrowser = (revision: string, path?: string) => {
    // Replaces path with current path if none passed.
    if (path === undefined) path = state.path;

    if (addressOrName) {
      navigate(proj.path({ peer, urn, addressOrName, revision, path }));
    } else {
      navigate(proj.path({ peer, urn, seed: seed.host, revision, path }));
    }
  };

  const fetchTree = async (path: string) => {
    return proj.getTree(urn, commit, path, seed.api);
  };

  const toggleMobileFileTree = () => {
    mobileFileTree = !mobileFileTree;
  };

  $: commit = proj.getOid(project.head, revision, branches);
  $: getBlob = loadBlob(path);
  $: loadingPath = state.status == Status.Loading ? state.path : null;
</script>

<style>
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

  @media (max-width: 960px) {
    .container {
      padding-left: 2rem;
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
</main>
