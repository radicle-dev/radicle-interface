<script lang="ts" strictEvents>
  import type { MaybeTree, Tree } from "@app/lib/project";

  import File from "@app/views/projects/Tree/File.svelte";
  import Folder from "@app/views/projects/Tree/Folder.svelte";

  export let fetchTree: (path: string) => Promise<MaybeTree>;
  export let path: string;
  export let tree: Tree;
  export let loadingPath: string | null = null;
</script>

{#each tree.entries as entry (entry.path)}
  {#if window.HEARTWOOD ? entry.kind === "tree" : entry.info.objectType === "TREE"}
    <Folder
      {fetchTree}
      {loadingPath}
      name={window.HEARTWOOD ? entry.name : entry.info.name}
      prefix={`${entry.path}/`}
      currentPath={path} />
  {:else}
    <File
      active={entry.path === path}
      loading={entry.path === loadingPath}
      name={window.HEARTWOOD ? entry.name : entry.info.name}
      path={entry.path} />
  {/if}
{/each}
