<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import type { BlobResult } from "./router";
  import type { Route } from "@app/lib/router";

  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import Layout from "./Layout.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Header from "./Source/Header.svelte";

  import BlobComponent from "./Source/Blob.svelte";
  import TreeComponent from "./Source/Tree.svelte";

  export let baseUrl: BaseUrl;
  export let blobResult: BlobResult;
  export let branches: string[];
  export let path: string;
  export let peer: string | undefined;
  export let peers: Remote[];
  export let project: Project;
  export let revision: string | undefined;
  export let tree: Tree;

  // Whether the mobile file tree is visible.
  let mobileFileTree = false;

  const api = new HttpdClient(baseUrl);

  const fetchTree = async (path: string) => {
    return api.project
      .getTree(project.id, tree.lastCommit.id, path)
      .catch(() => {
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

  $: peersWithRoute = peers.map(remote => ({
    remote,
    selected: remote.id === peer,
    route: {
      resource: "project.source",
      node: baseUrl,
      project: project.id,
      peer: remote.id,
    } as Route,
  }));

  $: branchesWithRoute = branches.map(name => ({
    name,
    route: {
      resource: "project.source",
      node: baseUrl,
      project: project.id,
      peer,
      revision: name,
    } as Route,
  }));
</script>

<style>
  .center-content {
    margin: 0 auto;
  }

  .container {
    display: flex;
    width: inherit;
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
  .sticky {
    position: sticky;
    top: 2rem;
    max-height: 100vh;
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

<Layout {baseUrl} {project} {peer} activeTab="source">
  <svelte:fragment slot="subheader">
    <Header
      node={baseUrl}
      {project}
      peers={peersWithRoute}
      branches={branchesWithRoute}
      {revision}
      {tree}
      historyLinkActive={false} />

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
  </svelte:fragment>

  <div class="container center-content">
    {#if tree.entries.length > 0}
      <div class="column-left" class:column-left-visible={mobileFileTree}>
        <div class="source-tree sticky">
          <TreeComponent
            projectId={project.id}
            {revision}
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
            blob={blobResult.blob}
            highlighted={blobResult.highlighted}
            rawPath={utils.getRawBasePath(
              project.id,
              baseUrl,
              tree.lastCommit.id,
            )} />
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
          <span slot="body">
            We couldn't find any files at this revision.
          </span>
        </Placeholder>
      </div>
    {/if}
  </div>
</Layout>
