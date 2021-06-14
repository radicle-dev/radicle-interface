<script lang="typescript">
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Address from '@app/Address.svelte';
  import { Org } from '@app/base/orgs/Org';
  import * as utils from '@app/utils';

  import Tree from './Tree.svelte';
  import Blob from './Blob.svelte';
  import Readme from './Readme.svelte';

  export let urn: string;
  export let commit: string;
  export let config: Config;
  export let path: string;
  export let onSelect: (event: { detail: string }) => void;
  export let org: string | null = null;

  const fetchTree = async (path: string) => {
    return proj.getTree(urn, commit, path, config);
  };

  $: isMarkdownPath = utils.isMarkdownPath(path);
  $: getBlob = path === "/"
    ? proj.getReadme(urn, commit, config)
    : proj.getBlob(urn, commit, path, { highlight: !isMarkdownPath }, config);
  $: getAnchor = org ? Org.getAnchor(org, urn, config) : null;
</script>

<style>
  main > header {
    font-size: 0.75rem;
    padding: 0 8rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;

  }
  main > header > * {
    margin-right: 0.75rem;
    border-radius: 0.25rem;
    min-width: max-content;
  }

  .commit {
    display: inline-block;
    font-family: var(--font-family-monospace);
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    padding: 0.5rem 0.75rem;
  }

  .anchor {
    display: flex;
  }
  .anchor-widget {
    display: flex;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-background);
  }
  .anchor-widget.not-anchored {
    color: var(--color-foreground-faded);
    background-color: var(--color-foreground-background);
  }
  .anchor-label {
    font-family: var(--font-family-monospace);
    margin-right: 0.5rem;
  }
  .anchor-label:last-child {
    margin-right: 0;
  }

  .stat {
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    background: var(--color-foreground-background);
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
    <!-- Loading -->
  {:then tree}
    <header>
      <div class="commit">
        commit {commit}
      </div>
      <div class="stat">
        <strong>{tree.stats.commits}</strong> commit(s)
      </div>
      <div class="stat">
        <strong>{tree.stats.contributors}</strong> contributor(s)
      </div>
      <div class="anchor">
        {#if org}
          {#await getAnchor}
            <Loading small margins />
          {:then anchor}
            {#if anchor === commit}
              <span class="anchor-widget">
                <span class="anchor-label">anchored</span>
                <Address address={org} compact resolve noBadge {config} />
              </span>
            {:else}
              <span class="anchor-widget not-anchored">
                <span class="anchor-label">not anchored 🔓</span>
              </span>
            {/if}
          {/await}
        {/if}
      </div>
    </header>
    <div class="container center-content">
      {#if tree.entries.length}
        <div class="column-left">
          <div class="source-tree">
            <Tree {tree} {path} {fetchTree} on:select={onSelect} />
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
  {:catch err}
    <div class="container center-content">
      <div class="error error-message text-small">
        <!-- TODO: Differentiate between (1) commit doesn't exist and (2) failed
             to fetch - this needs a change to the backend. -->
        API request to <code class="text-small">{err.url}</code> failed
      </div>
    </div>
  {/await}
</main>
