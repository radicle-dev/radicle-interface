<script lang="ts">
  import type { Author } from "@app/lib/cobs";

  import Avatar from "@app/components/Comment/Avatar.svelte";
  import { formatNodeId, formatTimestamp } from "@app/lib/utils";

  export let author: Author;
  export let caption: string | undefined = undefined;
  export let highlight: boolean = false;
  export let noAvatar: boolean = false;
  export let timestamp: number | undefined = undefined;

  const relativeTimestamp = (time: number | undefined) =>
    time ? new Date(time).toISOString() : undefined;
</script>

<style>
  .authorship {
    display: inline-flex;
    align-items: center;
    color: var(--color-foreground-5);
    padding: 0.125rem 0;
  }
  .id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .body {
    margin: 0 0.4rem;
    color: var(--color-foreground-5);
    white-space: nowrap;
  }
  .highlight {
    color: var(--color-foreground-6);
    font-weight: var(--font-weight-bold);
  }
  .date {
    color: var(--color-foreground-6);
  }
</style>

<span class="authorship txt-tiny" title={relativeTimestamp(timestamp)}>
  {#if !noAvatar}
    <Avatar inline source={author.id} title={author.id} />
  {/if}
  <span class:highlight class="id highlight layout-desktop">
    {formatNodeId(author.id)}
  </span>
  <span class:highlight class="id layout-mobile">
    {formatNodeId(author.id).replace("did:key:", "")}
  </span>
  <span class="body">
    {#if !caption}
      <slot />
    {:else}
      {caption}
    {/if}
  </span>
  {#if timestamp}
    <span class:date={highlight}>
      {formatTimestamp(timestamp)}
    </span>
  {/if}
</span>
