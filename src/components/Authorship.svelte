<script lang="ts" context="module">
  export type AuthorAliasColor =
    | "--color-primary-5"
    | "--color-fill-gray"
    | "--color-positive-5"
    | "--color-negative-5"
    | "--color-foreground-match-background"
    | undefined;
</script>

<script lang="ts">
  import Avatar from "@app/components/Avatar.svelte";
  import { formatNodeId, formatTimestamp } from "@app/lib/utils";

  export let authorId: string;
  export let authorAlias: string | undefined = undefined;
  export let authorAliasColor: AuthorAliasColor = "--color-fill-gray";
  export let authorIdColor: "--color-foreground-match-background" | undefined =
    undefined;
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
    gap: 0.5rem;
    font-size: var(--font-size-small);
    font-family: var(--font-family-monospace);
  }
  .author-id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-fill-secondary);
    font-weight: var(--font-weight-bold);
  }
  .alias {
    font-weight: var(--font-weight-medium);
  }
  .body {
    white-space: nowrap;
  }
</style>

<span class="authorship">
  {#if !noAvatar}
    <Avatar inline nodeId={authorId} />
  {/if}
  <span class="author-id" style:color="var({authorIdColor})">
    {formatNodeId(authorId)}
  </span>
  {#if authorAlias}
    <span class="alias" style:color="var({authorAliasColor})">
      ({authorAlias})
    </span>
  {/if}
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
