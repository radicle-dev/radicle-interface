<script lang="typescript">
  import { createEventDispatcher } from "svelte";

  import Loading from '@app/Loading.svelte';
  import type { Tree } from "@app/project";
  import { ObjectType } from "@app/project";

  import File from "./File.svelte";

  export let fetchTree: (path: string) => Promise<Tree>;
  export let name: string;
  export let prefix: string;
  export let currentPath: string;

  let expanded = currentPath.indexOf(prefix) === 0;
  let tree: Promise<Tree> | null = expanded ? fetchTree(prefix) : null;

  const dispatch = createEventDispatcher();
  const onSelectFile = ({ detail: path }: { detail: string }) =>
    dispatch("select", path);

  const onClick = () => {
    expanded = !expanded;

    if (expanded) {
      tree = fetchTree(prefix);
    }
  };
</script>

<style>
  .folder {
    display: flex;
    cursor: pointer;
    padding: 0.25rem;
    margin: 0.125rem 0;
    color: var(--color-foreground-level-6);
    user-select: none;
    line-height: 1.5rem;
    white-space: nowrap;
  }
  .folder:hover {
    background-color: var(--color-foreground-background);
    border-radius: 0.25rem;
  }

  .folder-name {
    margin-left: 0.25rem;
    color: var(--color-light);
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

<div class="folder" on:click={onClick}>
  <span class="folder-name">{name}/</span>
</div>

<div class="container">
  {#if expanded}
    {#await tree}
      <span class="loading"><Loading small margins /></span>
    {:then tree}
      {#if tree}
        {#each tree.entries as entry (entry.path)}
          {#if entry.info.objectType === ObjectType.Tree}
            <svelte:self
              {fetchTree}
              name={entry.info.name}
              on:select={onSelectFile}
              prefix={`${entry.path}/`}
              {currentPath} />
          {:else}
            <File
              active={entry.path === currentPath}
              loading={false}
              name={entry.info.name}
              on:click={() => {
                onSelectFile({ detail: entry.path });
              }} />
          {/if}
        {/each}
      {/if}
    {/await}
  {/if}
</div>
