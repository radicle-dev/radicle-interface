<script lang="ts">
  import { formatSeedAddress, formatSeedId } from "@app/utils";
  import type { Seed } from "@app/base/seeds/Seed";
  import Clipboard from "@app/Clipboard.svelte";

  export let seed: Seed;
  export let port: number;
  export let full = false;
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


<div>
  <div class="seed-address">
    <span class="seed-icon">{seed.emoji}</span>
    {#if full}
      <span><a href="/seeds/{seed.host}" class="link">{formatSeedId(seed.id)}@{seed.host}</a></span>
      <span class="faded">:{port}</span>
    {:else}
      <span><a href="/seeds/{seed.host}" class="link">{seed.host}</a></span>
    {/if}
  </div>
  <Clipboard text={full ? formatSeedAddress(seed.id, seed.host, port) : seed.host} />
</div>
<div class="desktop"/>
