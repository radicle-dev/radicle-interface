<script lang="ts">
  import type { BaseUrl } from "@http-client";

  import { isLocal } from "@app/lib/utils";

  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";

  export let baseUrl: BaseUrl;
  export let showLocalNode: boolean = false;
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
      {#if showLocalNode}
        Local Node
      {/if}
    {:else}
      <IconSmall name="seedling" />
      {baseUrl.hostname}
    {/if}
  </Link>
</span>
