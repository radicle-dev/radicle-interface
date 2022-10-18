<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { Tree } from "@app/project";
  import { ObjectType } from "@app/project";

  import File from "./Tree/File.svelte";
  import Folder from "./Tree/Folder.svelte";

  export let fetchTree: (path: string) => Promise<Tree>;
  export let path: string;
  export let tree: Tree;
  export let loadingPath: string | null = null;

  console.log("tree path:", path);

  const dispatch = createEventDispatcher();
  const onSelect = ({ detail: path }: { detail: string }): void => {
    dispatch("select", path);
  };
</script>

{#each tree.entries as entry (entry.path)}
  {#if entry.info.objectType === ObjectType.Tree}
    <Folder
      {fetchTree}
      {loadingPath}
      name={entry.info.name}
      prefix={`${entry.path}/`}
      currentPath={path}
      on:select={onSelect} />
  {:else}
    <File
      active={entry.path === path}
      loading={entry.path === loadingPath}
      name={entry.info.name}
      on:click={() => onSelect({ detail: entry.path })} />
  {/if}
{/each}
