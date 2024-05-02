<script lang="ts">
  import type {
    BaseUrl,
    Project,
    Remote,
    Tree,
    TreeStats,
  } from "@httpd-client";
  import type { BlobResult } from "./router";
  import type { Route } from "@app/lib/router";

  import { HttpdClient } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import Header from "./Source/Header.svelte";
  import Layout from "./Layout.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";

  import BlobComponent from "./Source/Blob.svelte";
  import TreeComponent from "./Source/Tree.svelte";
  import ProjectNameHeader from "./Source/ProjectNameHeader.svelte";

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
  export let stats: TreeStats;
  export let seeding: boolean;

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
      revision: remote.heads[project.defaultBranch]
        ? undefined
        : Object.keys(remote.heads)[0],
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
    padding: 0 1rem 1rem 1rem;
  }

  .column-left {
    display: flex;
    flex-direction: column;
    padding-right: 0.5rem;
  }

  .column-right {
    display: flex;
    flex-direction: column;
    width: 100%;
    /* To allow pre elements to shrink when overflowing */
    min-width: 0;
  }
  .placeholder {
    width: 100%;
    padding: 4rem 0;
    border: 1px solid var(--color-border-hint);
    border-radius: var(--border-radius-small);
  }

  .source-tree {
    overflow-x: hidden;
    width: 17.5rem;
    padding-right: 0.25rem;
  }
  .sticky {
    position: sticky;
    top: 0rem;
    max-height: calc(100vh - 5.5rem);
  }
</style>

<Layout {baseUrl} {project} activeTab="source">
  <ProjectNameHeader {project} {baseUrl} {seeding} slot="header" />

  <div style:margin="1rem 0 1rem 1rem" slot="subheader">
    <Header
      node={baseUrl}
      {project}
      peers={peersWithRoute}
      branches={branchesWithRoute}
      {revision}
      {tree}
      {stats}
      filesLinkActive={true}
      historyLinkActive={false} />
  </div>
  <div class="global-hide-on-desktop">
    {#if tree.entries.length > 0}
      <div style:margin="1rem">
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
        <div class="layout-mobile" style:margin="1rem">
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

  <div class="container center-content">
    {#if tree.entries.length > 0}
      <div class="column-left global-hide-on-mobile">
        <div class="source-tree sticky">
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
            {path}
            {baseUrl}
            projectId={project.id}
            blob={blobResult.blob}
            highlighted={blobResult.highlighted}
            rawPath={rawPath(tree.lastCommit.id)} />
        {:else if path === "/"}
          <div class="placeholder">
            <Placeholder iconName="no-file" caption="No README found." />
          </div>
        {:else}
          <div class="placeholder">
            <Placeholder iconName="no-file" caption="File not found." />
          </div>
        {/if}
      </div>
    {:else}
      <div class="placeholder">
        <Placeholder iconName="no-file" caption="No files at this revision." />
      </div>
    {/if}
  </div>
</Layout>
