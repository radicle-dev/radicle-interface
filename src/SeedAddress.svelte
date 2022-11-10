<script lang="ts">
  import {
    formatSeedAddress,
    formatSeedId,
    formatSeedHost,
    twemoji,
  } from "@app/utils";
  import type { Seed } from "@app/base/seeds/Seed";
  import Clipboard from "@app/Clipboard.svelte";
  import Link from "@app/router/Link.svelte";

  export let seed: Seed;
  export let port: number;
  export let full = false;

  const seedHost = seed.api.port
    ? `${seed.api.host}:${seed.api.port}`
    : `${formatSeedHost(seed.api.host)}`;
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
    <span class="seed-icon" use:twemoji>{seed.emoji}</span>
    {#if full}
      <span>
        <Link
          route={{
            resource: "seeds",
            params: { host: formatSeedHost(seedHost) },
          }}>
          <span class="txt-link">{formatSeedId(seed.id)}@{seed.host}</span>
        </Link>
      </span>
      <span class="txt-faded">:{port}</span>
    {:else}
      <span>
        <Link
          route={{
            resource: "seeds",
            params: { host: seedHost },
          }}>
          <span class="txt-link">{formatSeedHost(seedHost)}</span>
        </Link>
      </span>
    {/if}
  </div>
  <Clipboard
    small
    text={full ? formatSeedAddress(seed.id, seed.host, port) : seed.host} />
</div>
<div class="layout-desktop" />
