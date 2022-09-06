<script lang="ts">
  import { formatSeedAddress, formatSeedId, formatSeedHost } from "@app/utils";
  import type { Seed } from "@app/base/seeds/Seed";
  import Clipboard from "@app/Clipboard.svelte";

  export let seed: Seed;
  export let port: number;
  export let full = false;
</script>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }
  .seed-address {
    display: inline-flex;
    font-size: var(--font-size-regular);
    line-height: 2rem;
    color: var(--color-foreground-90);
    vertical-align: middle;
  }
  .seed-icon {
    width: 1rem;
    margin-right: 0.5rem;
  }
  .seed-address > * {
    vertical-align: middle;
  }
</style>

<div class="wrapper">
  <div class="seed-address">
    <span class="seed-icon">{seed.emoji}</span>
    {#if full}
      <span>
        <a href="/seeds/{formatSeedHost(seed.host)}" class="link">
          {formatSeedId(seed.id)}@{seed.host}
        </a>
      </span>
      <span class="faded">:{port}</span>
    {:else}
      <span>
        <a href="/seeds/{formatSeedHost(seed.host)}" class="link">
          {formatSeedHost(seed.host)}
        </a>
      </span>
    {/if}
  </div>
  <Clipboard
    small
    text={full ? formatSeedAddress(seed.id, seed.host, port) : seed.host} />
</div>
<div class="desktop" />
