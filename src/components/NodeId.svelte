<script lang="ts">
  import type { BaseUrl } from "@http-client";
  import { formatNodeId, parseNodeId, truncateId } from "@app/lib/utils";

  import Avatar from "./Avatar.svelte";
  import Link from "./Link.svelte";

  export let baseUrl: BaseUrl;
  export let nodeId: string;
  export let alias: string | undefined = undefined;
</script>

<style>
  .avatar-alias {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 1rem;
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
  }
  .no-alias {
    color: var(--color-foreground-dim);
  }
</style>

<div class="avatar-alias">
  <Avatar variant="small" {nodeId} />
  <Link styleHoverState route={{ resource: "users", did: nodeId, baseUrl }}>
    {#if alias}
      <span class="txt-overflow">
        {alias}
      </span>
    {:else}
      <span class="no-alias global-hide-on-mobile-down">
        {formatNodeId(nodeId)}
      </span>
      <span class="no-alias global-hide-on-small-desktop-up">
        {truncateId(parseNodeId(nodeId)?.pubkey || "")}
      </span>
    {/if}
  </Link>
</div>
