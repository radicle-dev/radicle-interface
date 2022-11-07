<script lang="ts">
  import type { Theme } from "@app/ThemeToggle.svelte";
  import type { ProjectRoute } from "@app/router/definitions";
  import type * as proj from "@app/project";

  import Loading from "@app/Loading.svelte";
  import Placeholder from "@app/Placeholder.svelte";
  import * as utils from "@app/utils";
  import Button from "@app/Button.svelte";
  import { theme } from "@app/ThemeToggle.svelte";
  import * as router from "@app/router";

  import Tree from "./Tree.svelte";
  import Blob from "./Blob.svelte";

  enum Status {
    Loading,
    Loaded,
  }

  type State =
    | { status: Status.Loading; path: string }
    | { status: Status.Loaded; path: string; blob: proj.Blob; theme: Theme };

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

  const loadBlob = async (path: string, theme: Theme): Promise<proj.Blob> => {
    if (
      state.status === Status.Loaded &&
      state.path === path &&
      state.theme === theme
    ) {
      return state.blob;
    }

    const isMarkdownPath = utils.isMarkdownPath(path);
    const promise =
      path === "/"
        ? project.getReadme(commit)
        : project.getBlob(
            commit,
            path,
            isMarkdownPath
              ? { highlight: false }
              : { highlight: true, theme: `base16-ocean.${theme}` },
          );

    state = { status: Status.Loading, path };
    state = { status: Status.Loaded, path, blob: await promise, theme };

    return state.blob;
  };

  // Get an image blob based on a relative path.
  const getImage = async (imagePath: string): Promise<proj.Blob> => {
    const finalPath = utils.canonicalize(imagePath, path);
    return project.getBlob(commit, finalPath, { highlight: false });
  };

  const onSelect = async (newPath: string, theme: Theme) => {
    // Ensure we don't spend any time in a "loading" state. This means
    // the loading spinner won't be shown, and instead the blob will be
    // displayed once loaded.
    const blob = await loadBlob(newPath, theme);
    getBlob = new Promise(resolve => resolve(blob));

    // Close mobile tree if user navigates to other file
    mobileFileTree = false;

    router.updateProjectRoute({
      view: { resource: "tree" },
      path: newPath,
    });
  };

  const fetchTree = async (path: string) => {
    return project.getTree(commit, path);
  };

  const toggleMobileFileTree = () => {
    mobileFileTree = !mobileFileTree;
  };

  $: getBlob = loadBlob(path, $theme);
  $: loadingPath = state.status === Status.Loading ? state.path : null;
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
              onSelect(e.detail, $theme);
            }} />
        </div>
      </div>
      <div class="column-right">
        {#await getBlob}
          <Loading small center />
        {:then blob}
          <Blob {line} {blob} {getImage} {activeRoute} />
        {:catch}
          <Placeholder emoji="🍂">
            <span slot="title">
              {#if path !== "/"}
                <div class="txt-monospace">{path}</div>
              {/if}
            </span>
            <span slot="body">
              {#if path === "/"}
                The README could not be loaded.
              {:else}
                This path could not be loaded.
              {/if}
            </span>
          </Placeholder>
        {/await}
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
