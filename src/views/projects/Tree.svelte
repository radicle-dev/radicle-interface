<script lang="ts" strictEvents>
  import type { Tree } from "@httpd-client";

  import { createEventDispatcher } from "svelte";

  import File from "./Tree/File.svelte";
  import Folder from "./Tree/Folder.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";

  export let fetchTree: (path: string) => Promise<Tree | undefined>;
  export let path: string;
  export let tree: Tree;
  export let revision: string;
  export let loadingPath: string | null = null;

  const dispatch = createEventDispatcher<{ select: string }>();
  const onSelect = ({ detail: path }: { detail: string }): void => {
    dispatch("select", path);
  };
</script>

{#each tree.entries as entry (entry.path)}
  {#if entry.kind === "tree"}
    <Folder
      {fetchTree}
      {loadingPath}
      {revision}
      name={entry.name}
      prefix={`${entry.path}/`}
      currentPath={path}
      on:select={onSelect} />
  {:else}
    <ProjectLink
      projectParams={{ view: { resource: "tree" }, path: entry.path, revision }}
      on:click={() => onSelect({ detail: entry.path })}>
      <File
        active={entry.path === path}
        loading={entry.path === loadingPath}
        name={entry.name} />
    </ProjectLink>
  {/if}
{/each}
