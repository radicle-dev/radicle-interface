<script lang="ts" strictEvents>
  import type { MaybeTree } from "@app/lib/project";

  import Loading from "@app/components/Loading.svelte";
  import { createEventDispatcher } from "svelte";

  import File from "./File.svelte";

  export let fetchTree: (path: string) => Promise<MaybeTree>;
  export let name: string;
  export let prefix: string;
  export let currentPath: string;
  export let loadingPath: string | null = null;

  let expanded = currentPath.indexOf(prefix) === 0;
  let tree: Promise<MaybeTree> = fetchTree(prefix).then(tree => {
    if (expanded) return tree;
  });

  const onClick = () => {
    expanded = !expanded;

    tree = fetchTree(prefix).then(tree => {
      if (expanded) return tree;
    });
  };
</script>

<style>
  .folder {
    display: flex;
    cursor: pointer;
    padding: 0.25rem;
    margin: 0.125rem 0;
    margin-left: 0.25rem;
    color: var(--color-secondary-6);
    user-select: none;
    line-height: 1.5rem;
    white-space: nowrap;
    background: none;
    border: none;
    font-family: unset;
    width: 100%;
  }
  .folder:hover {
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius-small);
  }

  .container {
    padding-left: 0.5rem;
    margin: 0;
  }

  .loading {
    display: inline-block;
    padding: 0.5rem 0;
  }
</style>

<button class="txt-regular folder" on:click={onClick}>{name}/</button>

<div class="container">
  {#if expanded}
    {#await tree}
      <span class="loading"><Loading small margins /></span>
    {:then tree}
      {#if tree}
        {#each tree.entries as entry (entry.path)}
          {#if window.HEARTWOOD ? entry.kind === "tree" : entry.info.objectType === "TREE"}
            <svelte:self
              {fetchTree}
              name={window.HEARTWOOD ? entry.name : entry.info.name}
              prefix={`${entry.path}/`}
              {loadingPath}
              {currentPath} />
          {:else}
            <File
              active={entry.path === currentPath}
              loading={entry.path === loadingPath}
              name={window.HEARTWOOD ? entry.name : entry.info.name}
              path={entry.path} />
          {/if}
        {/each}
      {/if}
    {/await}
  {/if}
</div>
