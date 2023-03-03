<script lang="ts">
  import type { Seed } from "@app/lib/seed";

  import Clipboard from "@app/components/Clipboard.svelte";
  import { formatSeedAddress, truncateId } from "@app/lib/utils";
  import { config } from "@app/lib/config";

  export let seed: Seed;
  export let port: number;
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
    color: var(--color-foreground-6);
    vertical-align: middle;
  }
  .seed-address > * {
    vertical-align: middle;
  }
</style>

<div class="wrapper">
  <div class="seed-address">
    {truncateId(seed.id)}@{seed.host}
    {#if port !== config.seeds.defaultNodePort}
      <span class="txt-faded">:{port}</span>
    {/if}
  </div>
  <Clipboard small text={formatSeedAddress(seed.id, seed.host, port)} />
</div>
