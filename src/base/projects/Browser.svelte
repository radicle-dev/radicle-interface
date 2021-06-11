<script lang="typescript">
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Address from '@app/Address.svelte';
  import { Org } from '@app/base/orgs/Org';

  import Tree from './Tree.svelte';
  import Blob from './Blob.svelte';

  export let urn: string;
  export let commit: string;
  export let config: Config;
  export let path: string;
  export let onSelect: (event: { detail: string }) => void;
  export let org: string | null = null;

  let blob: Promise<proj.Blob | null> | null = null;

  const fetchTree = async (path: string) => {
    return proj.getTree(urn, commit, path, config);
  };

  $: if (path === "/") {
    blob = proj.getReadme(urn, commit, config);
  } else {
    blob = proj.getBlob(urn, commit, path, config);
  }
  $: getAnchor = org ? Org.getAnchor(org, urn, config) : null;
</script>

<style>
  main > header {
    padding: 0 8rem;
    margin-bottom: 2rem;
    display: flex;
  }
  .commit {
    display: inline-block;
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    padding: 0.75rem;
    border-radius: 0.25rem;
  }

  .anchor {
    font-size: 0.75rem;
    padding: 0.75rem;
    display: inline-block;
    color: var(--color-positive);
    background-color: var(--color-positive-background);
    border-radius: 0.25rem;
    margin-left: 0.75rem;
    display: flex;
  }
  .anchor-label {
    margin-right: 0.5rem;
  }

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
</style>

<main>
  {#await proj.getTree(urn, commit, "/", config)}
    Loading..
  {:then tree}
    <header>
      <div class="commit">
        commit {commit}
      </div>
      {#if org}
        {#await getAnchor}
          <Loading small margins />
        {:then anchor}
          {#if anchor === commit}
            <span class="anchor">
              <span class="anchor-label">anchor</span>
              <Address address={org} compact resolve noBadge {config} />
            </span>
          {/if}
        {/await}
      {/if}
    </header>
    <div class="container center-content">
      {#if tree.entries.length}
        <div class="column-left">
          <div class="source-tree">
            <Tree {tree} {path} {fetchTree} on:select={onSelect} />
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
      <div class="error error-message text-small">
        API request to <code class="text-small">{err.url}</code> failed
      </div>
    </div>
  {/await}
</main>
