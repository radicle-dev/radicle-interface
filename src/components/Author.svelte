<script lang="ts">
  import Avatar from "@app/components/Avatar.svelte";
  import { formatNodeId } from "@app/lib/utils";

  export let nodeId: string;
  export let noAvatar: boolean = false;
</script>

<style>
  .authorship {
    display: inline-flex;
    align-items: center;
    color: var(--color-foreground-6);
    padding: 0.125rem 0;
  }
  .id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

<span class="authorship txt-tiny">
  {#if !noAvatar}
    <Avatar inline {nodeId} />
  {/if}
  <span class="id layout-desktop">
    {formatNodeId(nodeId)}
  </span>
  <span class="id layout-mobile">
    {formatNodeId(nodeId).replace("did:key:", "")}
  </span>
</span>
