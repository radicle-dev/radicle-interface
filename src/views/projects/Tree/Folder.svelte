<script lang="ts" strictEvents>
  import type { Tree } from "@httpd-client";

  import { createEventDispatcher } from "svelte";

  import Loading from "@app/components/Loading.svelte";

  import File from "./File.svelte";

  export let fetchTree: (path: string) => Promise<Tree | undefined>;
  export let name: string;
  export let prefix: string;
  export let currentPath: string;
  export let loadingPath: string | null = null;

  let expanded = currentPath.indexOf(prefix) === 0;
  let tree: Promise<Tree | undefined> = fetchTree(prefix).then(tree => {
    if (expanded) return tree;
  });

  const dispatch = createEventDispatcher<{ select: string }>();
  const onSelectFile = ({ detail: path }: { detail: string }) =>
    dispatch("select", path);

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
    color: var(--color-foreground-6);
    user-select: none;
    line-height: 1.5rem;
    white-space: nowrap;
  }
  .folder:hover {
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius-small);
  }

  .folder-name {
    margin-left: 0.25rem;
    color: var(--color-secondary-6);
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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="folder" on:click={onClick}>
  <span class="folder-name">{name}/</span>
</div>

<div class="container">
  {#if expanded}
    {#await tree}
      <span class="loading"><Loading noDelay small margins /></span>
    {:then tree}
      {#if tree}
        {#each tree.entries as entry (entry.path)}
          {#if entry.kind === "tree"}
            <svelte:self
              {fetchTree}
              name={entry.name}
              on:select={onSelectFile}
              prefix={`${entry.path}/`}
              {loadingPath}
              {currentPath} />
          {:else}
            <File
              active={entry.path === currentPath}
              loading={entry.path === loadingPath}
              name={entry.name}
              on:click={() => {
                onSelectFile({ detail: entry.path });
              }} />
          {/if}
        {/each}
      {/if}
    {/await}
  {/if}
</div>
