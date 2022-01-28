<script lang="ts">
  import { formatSeedAddress, formatSeedId, toClipboard } from "./utils";

  export let id: string;
  export let host: string;
  export let port: number;

  let seedCopied = false;

  const copySeed = (seedId: string, seedHost: string) => {
    return () => toClipboard(formatSeedAddress(seedId, seedHost, port)).then(() => {
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
    <span><a href="/seeds/{host}" class="link">{formatSeedId(id)}@{host}</a></span>
    <span class="faded">:{port}</span>
  </div>
</div>
<div>
  <button class="tiny faded" disabled={seedCopied} on:click={copySeed(id, host)}>
    {#if seedCopied}
      Copy ✓
    {:else}
      Copy
    {/if}
  </button>
</div>
