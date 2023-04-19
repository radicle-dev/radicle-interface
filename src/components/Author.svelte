<script lang="ts">
  import Avatar from "@app/components/Avatar.svelte";
  import { formatNodeId } from "@app/lib/utils";

  export let nodeId: string;
</script>

<style>
  .author {
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

<span class="author txt-tiny">
  <Avatar inline {nodeId} />
  <span class="id layout-desktop">
    {formatNodeId(nodeId)}
  </span>
  <span class="id layout-mobile">
    {formatNodeId(nodeId).replace("did:key:", "")}
  </span>
</span>
