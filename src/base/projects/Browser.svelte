<script lang="typescript">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';

  import Tree from './Tree.svelte';
  import Blob from './Blob.svelte';

  export let urn: string;
  export let commit: string;
  export let config: Config;
  export let path: string;

  let info: "loading" | proj.Info | null = null;
  let blob: Promise<proj.Blob | null> | null = null;

  const fetchTree = async (path: string) => {
    return proj.getTree(urn, commit, path, config);
  };

  const onSelect = async ({ detail: path }: { detail: string }) => {
    navigate(`/projects/${urn}/${commit}/${path}`);
  };

  $: if (path === "/") {
    blob = proj.getReadme(urn, commit, config);
  } else {
    blob = proj.getBlob(urn, commit, path, config);
  }
</script>

<style>
  .center-content {
    margin: 0 auto;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
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
    overflow-x: auto;
  }
</style>

<div class="container center-content">
  {#if commit}
    <div class="column-left">
      <div class="source-tree">
        {#await proj.getTree(urn, commit, "/", config)}
          Loading..
        {:then tree}
          <Tree {tree} {path} {fetchTree} on:select={onSelect} />
        {:catch err}
          {err}
        {/await}
      </div>
    </div>
    <div class="column-right">
      {#await blob}
        <Loading small center />
      {:then blob}
        {#if blob}
          <Blob {blob} />
        {:else}
          <!-- Project has no README -->
        {/if}
      {:catch}
        <!-- TODO: Handle error -->
      {/await}
    </div>
  {/if}
</div>
