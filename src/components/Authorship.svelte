<script lang="ts" context="module">
  export type AuthorAliasColor =
    | "--color-primary-5"
    | "--color-fill-gray"
    | "--color-positive-5"
    | "--color-negative-5"
    | undefined;
</script>

<script lang="ts">
  import Avatar from "@app/components/Avatar.svelte";
  import { formatNodeId, formatTimestamp } from "@app/lib/utils";

  export let authorId: string;
  export let authorAlias: string | undefined = undefined;
  export let authorAliasColor: AuthorAliasColor = "--color-fill-gray";
  export let caption: string | undefined = undefined;
  export let noAvatar: boolean = false;
  export let timestamp: number | undefined = undefined;

  const relativeTimestamp = (time: number | undefined) =>
    time ? new Date(time * 1000).toString() : undefined;
</script>

<style>
  .authorship {
    display: inline-flex;
    align-items: center;
    color: inherit;
    padding: 0.125rem 0;
    gap: 0.25rem;
  }
  .id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-monospace);
    color: var(--color-fill-secondary);
    font-weight: var(--font-weight-bold);
  }
  .body {
    white-space: nowrap;
  }
</style>

<span class="authorship txt-tiny">
  {#if !noAvatar}
    <Avatar inline nodeId={authorId} />
  {/if}
  <span class="id layout-desktop">
    {formatNodeId(authorId)}
    {#if authorAlias}
      <span style:color="var({authorAliasColor})">({authorAlias})</span>
    {/if}
  </span>
  <span class="id layout-mobile">
    {formatNodeId(authorId).replace("did:key:", "")}
    {#if authorAlias}
      <span style:color="var({authorAliasColor})">({authorAlias})</span>
    {/if}
  </span>
  {#if !caption}
    <slot />
  {:else}
    <span class="body">
      {caption}
    </span>
  {/if}
  {#if timestamp}
    <span title={relativeTimestamp(timestamp)}>
      {formatTimestamp(timestamp)}
    </span>
  {/if}
</span>
