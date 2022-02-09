<script lang="ts">
  import { formatSeedAddress, formatSeedId, toClipboard } from "./utils";
  import type { Seed } from "@app/base/seeds/Seed";

  export let seed: Seed;
  export let port: number;
  export let full = false;

  let seedCopied = false;

  const copySeed = (seedId: string, seedHost: string) => {
    const str = full
      ? formatSeedAddress(seedId, seedHost, port)
      : seedHost;
    return () => toClipboard(str).then(() => {
      seedCopied = true;
      setTimeout(() => {
        seedCopied = false;
      }, 3000);
    });
  };
</script>

<style>
  .seed-address {
    display: inline-flex;
    font-size: 1rem;
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


<div class="desktop">
  <div class="seed-address">
    <span class="seed-icon">🌱</span>
    {#if full}
      <span><a href="/seeds/{seed.host}" class="link">{formatSeedId(seed.id)}@{seed.host}</a></span>
      <span class="faded">:{port}</span>
    {:else}
      <span><a href="/seeds/{seed.host}" class="link">{seed.host}</a></span>
    {/if}
  </div>
</div>
<div>
  <button class="tiny faded" disabled={seedCopied} on:click={copySeed(seed.id, seed.host)}>
    {#if seedCopied}
      Copy ✓
    {:else}
      Copy
    {/if}
  </button>
</div>
