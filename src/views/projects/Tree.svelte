<script lang="ts" strictEvents>
  import type { MaybeTree, Tree } from "@app/lib/project";

  import { createEventDispatcher } from "svelte";

  import { Kind } from "@app/lib/project";

  import File from "./Tree/File.svelte";
  import Folder from "./Tree/Folder.svelte";

  export let fetchTree: (path: string) => Promise<MaybeTree>;
  export let path: string;
  export let tree: Tree;
  export let loadingPath: string | null = null;

  const dispatch = createEventDispatcher<{ select: string }>();
  const onSelect = ({ detail: path }: { detail: string }): void => {
    dispatch("select", path);
  };
</script>

{#each tree.entries as entry (entry.path)}
  {#if entry.kind === Kind.Tree}
    <Folder
      {fetchTree}
      {loadingPath}
      name={entry.name}
      prefix={`${entry.path}/`}
      currentPath={path}
      on:select={onSelect} />
  {:else}
    <File
      active={entry.path === path}
      loading={entry.path === loadingPath}
      name={entry.name}
      on:click={() => onSelect({ detail: entry.path })} />
  {/if}
{/each}
