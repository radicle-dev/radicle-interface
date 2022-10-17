<script lang="ts">
  import type { Seed } from "@app/base/seeds/Seed";

  import { formatSeedHost } from "@app/utils";
  import Clipboard from "@app/Clipboard.svelte";

  export let seed: Seed;
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
    <span class="seed-icon">{seed.emoji}</span>
    <span>
      <a
        href="/seeds/{formatSeedHost(seed.httpApi.host)}:{seed.httpApi.port}"
        class="link">
        {formatSeedHost(seed.host)}
      </a>
    </span>
  </div>
  <Clipboard small text={seed.host} />
</div>
<div class="desktop" />
