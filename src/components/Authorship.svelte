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
    color: inherit;
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

<span class="authorship txt-tiny">
  {#if !noAvatar}
    <Avatar inline nodeId={authorId} />
  {/if}
  <span class="id layout-desktop">
    {formatNodeId(authorId)}
  </span>
  <span class="id layout-mobile">
    {formatNodeId(authorId).replace("did:key:", "")}
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
