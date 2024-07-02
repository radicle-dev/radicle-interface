<script lang="ts">
  import type { BaseUrl } from "@http-client";

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
    style="display: flex; align-items: center; gap: 0.25rem;"
    route={{
      resource: "nodes",
      params: {
        baseUrl,
        projectPageIndex: 0,
      },
    }}>
    <IconSmall name="seedling" />
    {baseUrl.hostname}
  </Link>
</span>
