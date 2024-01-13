<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import { isLocal } from "@app/lib/utils";

  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";

  export let baseUrl: BaseUrl;
</script>

<style>
  .segment :global(a:hover) {
    color: var(--color-fill-secondary);
  }
</style>

<span class="segment">
  <Link
    title={isLocal(baseUrl.hostname) ? "Local Node" : undefined}
    style="display: flex; align-items: center; gap: 0.25rem;"
    route={{
      resource: "nodes",
      params: {
        baseUrl,
        projectPageIndex: 0,
      },
    }}>
    {#if isLocal(baseUrl.hostname)}
      <IconSmall name="device" />
    {:else}
      <IconSmall name="globe" />
      {baseUrl.hostname}
    {/if}
  </Link>
</span>
