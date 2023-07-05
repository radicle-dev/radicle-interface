<script lang="ts" strictEvents>
  import type { BaseUrl, Tree } from "@httpd-client";

  import { createEventDispatcher } from "svelte";

  import Loading from "@app/components/Loading.svelte";
  import Link from "@app/components/Link.svelte";

  import File from "./File.svelte";

  export let baseUrl: BaseUrl;
  export let currentPath: string;
  export let fetchTree: (path: string) => Promise<Tree | undefined>;
  export let name: string;
  export let peer: string | undefined;
  export let prefix: string;
  export let projectId: string;
  export let revision: string;

  $: expanded = currentPath.indexOf(prefix) === 0;
  $: tree = expanded
    ? fetchTree(prefix).then(tree => {
        return tree;
      })
    : Promise.resolve(undefined);

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
<!-- svelte-ignore a11y-no-static-element-interactions -->
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
            <!-- svelte:self doesn't check types, make sure to pass in all
            required props! -->
            <svelte:self
              name={entry.name}
              on:select={onSelectFile}
              prefix={`${entry.path}/`}
              {baseUrl}
              {currentPath}
              {fetchTree}
              {peer}
              {projectId}
              {revision} />
          {:else}
            <Link
              route={{
                resource: "projects",
                params: {
                  id: projectId,
                  baseUrl,
                  path: entry.path,
                  peer,
                  revision,
                  view: { resource: "tree" },
                },
              }}
              on:afterNavigate={() => onSelectFile({ detail: entry.path })}>
              <File active={entry.path === currentPath} name={entry.name} />
            </Link>
          {/if}
        {/each}
      {/if}
    {/await}
  {/if}
</div>
