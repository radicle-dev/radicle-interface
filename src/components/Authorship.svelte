<script lang="ts">
  import type { Author } from "@app/lib/cobs";

  import {
    formatRadicleId,
    formatSeedId,
    formatTimestamp,
  } from "@app/lib/utils";

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
  <span class="highlight">
    {window.HEARTWOOD ? formatSeedId(author.id) : formatRadicleId(author.id)}
  </span>
  <span class="caption">&nbsp;{caption}&nbsp;</span>
  <span class="txt-tiny date">
    {formatTimestamp(timestamp)}
  </span>
</span>
