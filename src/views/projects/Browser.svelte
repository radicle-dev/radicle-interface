<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import type { BlobResult } from "./router";
  import type { LoadedSourceBrowsingView } from "@app/views/projects/router";

  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import SourceBrowsingHeader from "./SourceBrowsingHeader.svelte";

  import BlobComponent from "./Blob.svelte";
  import TreeComponent from "./Tree.svelte";

  export let baseUrl: BaseUrl;
  export let branches: Record<string, string> | undefined;
  export let commit: string;
  export let commitCount: number;
  export let contributorCount: number;
  export let hash: string | undefined;
  export let path: string;
  export let peer: string | undefined;
  export let peers: Remote[];
  export let project: Project;
  export let revision: string | undefined;
  export let tree: Tree;
  export let view: LoadedSourceBrowsingView;

  export let blobResult: BlobResult;

  // Whether the mobile file tree is visible.
  let mobileFileTree = false;

  const api = new HttpdClient(baseUrl);

  const fetchTree = async (path: string) => {
    return api.project.getTree(project.id, commit, path).catch(() => {
      blobResult = {
        ok: false,
        error: {
          message: "Not able to expand directory",
          path,
        },
      };
      return undefined;
    });
  };
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

<SourceBrowsingHeader
  commitId={tree.lastCommit.id}
  defaultBranch={project.defaultBranch}
  projectId={project.id}
  {baseUrl}
  {branches}
  {commitCount}
  {contributorCount}
  {peers}
  {peer}
  {revision}
  {view} />

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
            projectId={project.id}
            revision={revision ?? project.defaultBranch}
            {baseUrl}
            {fetchTree}
            {path}
            {peer}
            {tree}
            on:select={() => {
              // Close mobile tree if user navigates to other file.
              mobileFileTree = false;
            }} />
        </div>
      </div>
      <div class="column-right">
        {#if blobResult.ok}
          <BlobComponent
            {baseUrl}
            projectId={project.id}
            {peer}
            {revision}
            {path}
            {hash}
            blob={blobResult.blob}
            highlighted={blobResult.highlighted}
            rawPath={utils.getRawBasePath(project.id, baseUrl, commit)} />
        {:else}
          <Placeholder emoji="🍂">
            <span slot="title">
              <div class="txt-monospace">{blobResult.error.path}</div>
            </span>
            <span slot="body">
              {blobResult.error.message}
            </span>
          </Placeholder>
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
