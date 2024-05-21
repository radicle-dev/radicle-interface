<script lang="ts">
  import { formatNodeId } from "@app/lib/utils";

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
</style>

<Id id={nodeId} subject={formatNodeId(nodeId)} style="none">
  <div class="avatar-alias">
    <Avatar {nodeId} />
    {#if alias}
      {alias}
    {:else}
      {formatNodeId(nodeId)}
    {/if}
  </div>
</Id>
