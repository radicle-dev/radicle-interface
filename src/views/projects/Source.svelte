<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import type { BlobResult } from "./router";
  import type { Route } from "@app/lib/router";

  import { HttpdClient } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import File from "@app/components/File.svelte";
  import Header from "./Source/Header.svelte";
  import Layout from "./Layout.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";

  import BlobComponent from "./Source/Blob.svelte";
  import TreeComponent from "./Source/Tree.svelte";
  import FilePath from "@app/components/FilePath.svelte";

  export let baseUrl: BaseUrl;
  export let rawPath: (commit?: string) => string;
  export let blobResult: BlobResult;
  export let branches: string[];
  export let path: string;
  export let peer: string | undefined;
  export let peers: Remote[];
  export let project: Project;
  export let revision: string | undefined;
  export let tree: Tree;
  export let seeding: boolean;

  // Whether the mobile file tree is visible.
  let mobileFileTree = false;
  let treeElement: HTMLElement | undefined = undefined;
  let treeOverflow: boolean = false;

  $: if (treeElement) {
    treeOverflow = treeElement.scrollHeight > treeElement.offsetHeight;
  }

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
    padding-right: 1.5rem;
  }

  .column-right {
    display: flex;
    flex-direction: column;
    min-width: var(--content-min-width);
    width: 100%;
  }

  .source-tree {
    overflow-x: hidden;
    width: 17.5rem;
    padding-right: 0.25rem;
  }
  .source-tree-overflow {
    border-bottom: 1px solid var(--color-fill-separator);
    border-top: 1px solid var(--color-fill-separator);
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
    .sticky {
      max-height: initial;
    }
  }
</style>

<Layout {baseUrl} {project} {seeding} activeTab="source">
  <svelte:fragment slot="subheader">
    <div style:margin-top="1rem">
      <Header
        node={baseUrl}
        {project}
        peers={peersWithRoute}
        branches={branchesWithRoute}
        {revision}
        {tree}
        filesLinkActive={true}
        historyLinkActive={false} />

      {#if tree.entries.length > 0}
        <div class="layout-mobile">
          <Button
            styleWidth="100%"
            size="large"
            variant="outline"
            on:click={() => {
              mobileFileTree = !mobileFileTree;
            }}>
            Browse
          </Button>
        </div>

        {#if mobileFileTree}
          <div class="layout-mobile" style:margin-top="1rem">
            <TreeComponent
              projectId={project.id}
              {revision}
              {baseUrl}
              {fetchTree}
              {path}
              {peer}
              {tree}
              on:select={() => {
                mobileFileTree = false;
              }} />
          </div>
        {/if}
      {/if}
    </div>
  </svelte:fragment>

  <div class="container center-content">
    {#if tree.entries.length > 0}
      <div class="column-left">
        <div
          bind:this={treeElement}
          class="source-tree sticky"
          class:source-tree-overflow={treeOverflow}>
          <TreeComponent
            projectId={project.id}
            {revision}
            {baseUrl}
            {fetchTree}
            {path}
            {peer}
            {tree} />
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
            rawPath={rawPath(tree.lastCommit.id)} />
        {:else}
          <File>
            <FilePath
              slot="left-header"
              filenameWithPath={blobResult.error.path} />
            <div style:margin="4rem 0" style:width="100%">
              <Placeholder iconName="no-file" caption="File not found" />
            </div>
          </File>
        {/if}
      </div>
    {:else}
      <div style:margin="4rem 0" style:width="100%">
        <Placeholder iconName="no-file" caption="No files at this revision" />
      </div>
    {/if}
  </div>
</Layout>
