<script lang="ts">
  import { formatNodeId } from "@app/lib/utils";

  import Avatar from "./Avatar.svelte";
  import HoverPopover from "./HoverPopover.svelte";
  import CopyableId from "./CopyableId.svelte";

  export let nodeId: string;
  export let alias: string | undefined = undefined;
  export let large: boolean = false;
  export let stylePopoverPositionLeft = "-4.5rem";
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
  .large {
    height: 1.25rem;
    gap: 0.5rem;
  }
  .popover-avatar {
    height: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    white-space: nowrap;
  }
  .popover-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>

<HoverPopover
  {stylePopoverPositionLeft}
  stylePopoverPadding="0.5rem 0.5rem 0.5rem 0.75rem"
  stylePopoverPositionTop="-4.5rem">
  <div slot="toggle" class="avatar-alias" class:large>
    <Avatar {nodeId} />
    {#if alias}
      {alias}
    {:else}
      {formatNodeId(nodeId)}
    {/if}
  </div>

  <div slot="popover">
    <div class="popover-container">
      <div class="popover-avatar">
        <Avatar {nodeId} />
        {#if alias}
          {alias}
        {/if}
      </div>

      <CopyableId id={nodeId} style="oid">
        {formatNodeId(nodeId)}
      </CopyableId>
    </div>
  </div>
</HoverPopover>
