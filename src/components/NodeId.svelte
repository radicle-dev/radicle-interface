<script lang="ts">
  import { formatNodeId, parseNodeId, truncateId } from "@app/lib/utils";

  import Avatar from "./Avatar.svelte";
  import Id from "./Id.svelte";

  export let nodeId: string;
  export let alias: string | undefined = undefined;
</script>

<style>
  .avatar-alias {
    display: flex;
    align-items: center;
    justify-content: center;
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

<Id id={nodeId} style="none">
  <div class="avatar-alias">
    <Avatar {nodeId} />
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
  </div>
</Id>
