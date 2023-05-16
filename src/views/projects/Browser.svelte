<script lang="ts" context="module">
  import { writable } from "svelte/store";

  export const browserErrorStore = writable<
    { message: string; path: string } | undefined
  >();
</script>

<script lang="ts">
  import type { BaseUrl, Blob, Project, Tree } from "@httpd-client";

  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";

  import BlobComponent from "./Blob.svelte";
  import TreeComponent from "./Tree.svelte";

  enum Status {
    Loading,
    Loaded,
  }

  type State =
    | { status: Status.Loading; path: string }
    | { status: Status.Loaded; path: string; blob: Blob; commit: string };

  export let path: string;
  export let hash: string | undefined = undefined;
  export let project: Project;
  export let baseUrl: BaseUrl;
  export let tree: Tree;
  export let revision: string | undefined;
  export let commit: string;

  // When the component is loaded the first time, the blob is yet to be loaded.
  let state: State = { status: Status.Loading, path };
  // Whether the mobile file tree is visible.
  let mobileFileTree = false;

  const api = new HttpdClient(baseUrl);

  // When a user clicks between multiple files, we want to retain the previous
  // file contents and show them while the new file is loading to prevent the
  // UI from flickering or showing a loading indicator.
  let previousBlob: Blob;

  const loadBlob = async (projectId: string, commit: string, path: string) => {
    browserErrorStore.set(undefined);
    if (
      state.status === Status.Loaded &&
      state.path === path &&
      state.commit === commit
    ) {
      return state.blob;
    }

    state = { status: Status.Loading, path };

    let blob;
    if (path === "/") {
      blob = await api.project.getReadme(projectId, commit);
    } else {
      blob = await api.project.getBlob(projectId, commit, path);
    }

    state = { status: Status.Loaded, path, blob, commit };
    previousBlob = blob;
    return blob;
  };

  const fetchTree = async (path: string) => {
    return api.project.getTree(project.id, commit, path).catch(() => {
      browserErrorStore.set({
        message: "Not able to expand directory",
        path,
      });
      return undefined;
    });
  };

  $: getBlob = loadBlob(project.id, commit, path).catch(() => {
    browserErrorStore.set({ message: "Not able to load file", path });
    return undefined;
  });
  $: loadingPath =
    !$browserErrorStore && state.status === Status.Loading ? state.path : null;
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

  .placeholder {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .source-tree {
    overflow-x: hidden;
  }
  nav {
    padding: 0 2rem;
  }
  .sticky {
    position: sticky;
    top: 2rem;
    max-height: 100vh;
  }

  @media (max-width: 960px) {
    .container {
      padding-left: 2rem;
    }
  }

  @media (max-width: 720px) {
    .column-right {
      padding: 1.5rem 0;
      min-width: 0;
    }
    .placeholder {
      padding: 1.5rem;
    }
    .source-tree {
      padding: 0 2rem;
      margin: 1rem 0;
    }
    .container {
      padding: 0;
      flex-direction: column;
    }
    .column-left {
      display: none;
      padding-right: 0;
    }
    .column-left-visible {
      display: block;
    }
    .sticky {
      max-height: initial;
    }
  }
</style>

<main>
  <!-- Mobile navigation -->
  {#if tree.entries.length > 0}
    <nav class="layout-mobile">
      <Button
        style="width: 100%;"
        variant="secondary"
        on:click={() => {
          mobileFileTree = !mobileFileTree;
        }}>
        Browse
      </Button>
    </nav>
  {/if}

  <div class="container center-content">
    {#if tree.entries.length > 0}
      <div class="column-left" class:column-left-visible={mobileFileTree}>
        <div class="source-tree sticky">
          <TreeComponent
            {tree}
            {path}
            {fetchTree}
            {loadingPath}
            revision={revision ?? project.defaultBranch}
            on:select={() => {
              // Close mobile tree if user navigates to other file
              mobileFileTree = false;
            }} />
        </div>
      </div>
      <div class="column-right">
        {#if $browserErrorStore}
          <Placeholder emoji="🍂">
            <span slot="title">
              <div class="txt-monospace">{$browserErrorStore.path}</div>
            </span>
            <span slot="body">
              <span>
                {#if $browserErrorStore.path === "/"}
                  The README could not be loaded.
                {:else}
                  {$browserErrorStore.message}
                {/if}
              </span>
            </span>
          </Placeholder>
        {:else}
          {#await getBlob}
            {#if previousBlob}
              <div class="layout-desktop">
                <BlobComponent
                  {path}
                  {hash}
                  blob={previousBlob}
                  rawPath={utils.getRawBasePath(project.id, baseUrl, commit)} />
              </div>
              <div class="layout-mobile">
                <Loading small center />
              </div>
            {:else}
              <Loading small center />
            {/if}
          {:then blob}
            {#if blob}
              <BlobComponent
                {path}
                {hash}
                {blob}
                rawPath={utils.getRawBasePath(project.id, baseUrl, commit)} />
            {/if}
          {/await}
        {/if}
      </div>
    {:else}
      <div class="placeholder">
        <Placeholder emoji="👀">
          <span slot="title">Nothing to show</span>
          <span slot="body">We couldn't find any files at this revision.</span>
        </Placeholder>
      </div>
    {/if}
  </div>
</main>
