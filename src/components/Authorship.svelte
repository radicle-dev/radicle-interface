<script lang="ts">
  import Avatar from "@app/components/Avatar.svelte";
  import { formatNodeId, formatTimestamp } from "@app/lib/utils";

  export let authorId: string;
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
    color: var(--color-foreground-6);
    padding: 0.125rem 0;
    gap: 0.25rem;
  }
  .id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .body {
    white-space: nowrap;
  }
</style>

<span class="authorship txt-tiny" title={relativeTimestamp(timestamp)}>
  {#if !noAvatar}
    <Avatar inline nodeId={authorId} />
  {/if}
  <span class="id layout-desktop">
    {formatNodeId(authorId)}
  </span>
  <span class="id layout-mobile">
    {formatNodeId(authorId).replace("did:key:", "")}
  </span>
  <span class="body">
    {#if !caption}
      <slot />
    {:else}
      {caption}
    {/if}
  </span>
  {#if timestamp}
    {formatTimestamp(timestamp)}
  {/if}
</span>
