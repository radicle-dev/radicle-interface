<script lang="ts" context="module">
  import { writable } from "svelte/store";

  export const browserErrorStore = writable<
    { message: string; path: string } | undefined
  >();
</script>

<script lang="ts">
  import type * as proj from "@app/lib/project";
  import type { ProjectRoute } from "@app/lib/router/definitions";

  import * as router from "@app/lib/router";
  import Button from "@app/components/Button.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import { onMount } from "svelte";

  import Tree from "./Tree.svelte";
  import Blob from "./Blob.svelte";

  enum Status {
    Loading,
    Loaded,
  }

  type State =
    | { status: Status.Loading; path: string }
    | { status: Status.Loaded; path: string; blob: proj.Blob };

  export let project: proj.Project;
  export let tree: proj.Tree;
  export let commit: string;
  export let activeRoute: ProjectRoute;

  $: path = activeRoute.params.path || "/";
  $: line = activeRoute.params.line;

  // When the component is loaded the first time, the blob is yet to be loaded.
  let state: State = { status: Status.Loading, path };
  // Whether the mobile file tree is visible.
  let mobileFileTree = false;

  const loadBlob = async (path: string) => {
    if (state.status === Status.Loaded && state.path === path) {
      return state.blob;
    }

    const promise =
      path === "/" ? project.getReadme(commit) : project.getBlob(commit, path);

    state = { status: Status.Loading, path };
    state = { status: Status.Loaded, path, blob: await promise };
    return state.blob;
  };

  onMount(() => {
    browserErrorStore.set(undefined);
  });

  const onSelect = async (newPath: string) => {
    browserErrorStore.set(undefined);
    // Ensure we don't spend any time in a "loading" state. This means
    // the loading spinner won't be shown, and instead the blob will be
    // displayed once loaded.
    const blob = await loadBlob(newPath).catch(() => {
      browserErrorStore.set({
        message: "Not able to load selected file",
        path: newPath,
      });
      return undefined;
    });
    if (blob) {
      getBlob = new Promise(resolve => resolve(blob));
    }

    // Close mobile tree if user navigates to other file
    mobileFileTree = false;

    router.updateProjectRoute({
      view: { resource: "tree" },
      path: newPath,
    });
  };

  const fetchTree = async (path: string) => {
    return project.getTree(commit, path).catch(() => {
      browserErrorStore.set({
        message: "Not able to expand directory",
        path,
      });
      return undefined;
    });
  };

  const toggleMobileFileTree = () => {
    mobileFileTree = !mobileFileTree;
  };

  $: getBlob = loadBlob(path).catch(() => {
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
        on:click={toggleMobileFileTree}>
        Browse
      </Button>
    </nav>
  {/if}

  <div class="container center-content">
    {#if tree.entries.length > 0}
      <div class="column-left" class:column-left-visible={mobileFileTree}>
        <div class="source-tree sticky">
          <Tree
            {tree}
            {path}
            {fetchTree}
            {loadingPath}
            on:select={e => {
              onSelect(e.detail);
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
            <Loading small center />
          {:then blob}
            {#if blob}
              <Blob
                {line}
                {blob}
                {activeRoute}
                rawPath={project.getRawPath(commit)} />
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
