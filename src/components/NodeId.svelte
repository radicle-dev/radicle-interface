<script lang="ts">
  import { formatNodeId } from "@app/lib/utils";

  import Avatar from "./Avatar.svelte";
  import HoverPopover from "./HoverPopover.svelte";
  import Clipboard from "./Clipboard.svelte";

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
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-small);
    color: var(--color-fill-secondary);
  }
  .large {
    height: 1.25rem;
    gap: 0.5rem;
  }
  .node-id {
    height: 2.5rem;
    padding: 0 0.5rem 0 0.75rem;
    display: flex;
    align-items: center;
    white-space: nowrap;
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

  <div slot="popover" class="node-id">
    <span class="global-hash">{formatNodeId(nodeId)}</span>
    <span style:color="var(--color-fill-secondary)">
      <Clipboard small text={nodeId} />
    </span>
  </div>
</HoverPopover>
