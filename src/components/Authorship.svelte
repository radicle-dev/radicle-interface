<script lang="ts">
  import type { Author } from "@app/lib/cobs";

  import { formatNodeId, formatTimestamp } from "@app/lib/utils";

  export let author: Author;
  export let timestamp: number;
  export let caption: string;
</script>

<style>
  .authorship {
    display: flex;
    align-items: center;
    color: var(--color-foreground);
    padding: 0.125rem 0;
  }
  .id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .caption {
    color: var(--color-foreground-5);
  }
  .highlight {
    color: var(--color-foreground-6);
    font-weight: var(--font-weight-bold);
  }
  .date {
    color: var(--color-foreground-6);
  }
</style>

<span class="authorship txt-tiny">
  <span class="id highlight layout-desktop">{formatNodeId(author.id)}</span>
  <span class="id highlight layout-mobile">
    {formatNodeId(author.id).replace("did:key:", "")}
  </span>
  <span class="caption">&nbsp;{caption}&nbsp;</span>
  <span class="date">
    {formatTimestamp(timestamp)}
  </span>
</span>
