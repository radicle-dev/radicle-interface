<script lang="ts">
  import { formatNodeId } from "@app/lib/utils";

  import Avatar from "./Avatar.svelte";
  import HoverPopover from "./HoverPopover.svelte";
  import CopyableId from "./CopyableId.svelte";

  export let nodeId: string;
  export let alias: string | undefined = undefined;
  export let disableTooltip: boolean = false;
  export let large: boolean = false;

  export let styleColor: string | undefined = undefined;
</script>

<style>
  .avatar-alias {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    height: 1rem;
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    color: var(--color-foreground-contrast);
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
    color: var(--color-foreground-contrast);
  }
  .popover-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
  }
</style>

<HoverPopover
  disabled={disableTooltip}
  popoverPositionLeft="-4.5rem"
  popoverPositionTop="-4.5rem">
  <div slot="toggle" class="avatar-alias" style:color={styleColor} class:large>
    <Avatar {nodeId} />
    {#if alias}
      {alias}
    {:else}
      {formatNodeId(nodeId)}
    {/if}
  </div>

  <div style:padding="0.5rem 0.5rem 0.5rem 0.75rem" slot="popover">
    <div class="popover-container">
      <div class="popover-avatar">
        <Avatar {nodeId} />
        {#if alias}
          {alias}
        {/if}
      </div>

      <CopyableId id={nodeId}>
        {formatNodeId(nodeId)}
      </CopyableId>
    </div>
  </div>
</HoverPopover>
