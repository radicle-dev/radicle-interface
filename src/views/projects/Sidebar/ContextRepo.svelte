<script lang="ts">
  import type { BaseUrl, Node, Project } from "@http-client";

  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";
  import { isLocal } from "@app/lib/utils";
  import { capitalize } from "lodash";

  export let disablePopovers: boolean = false;
  export let project: Project;
  export let baseUrl: BaseUrl;
  export let node: Node;

  let expandedNode = false;

  $: shortSeedingPolicy =
    node.config?.scope === "all" && node.config?.policy === "allow"
      ? "permissive"
      : "restrictive";
</script>

<style>
  .nids {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .node {
    display: flex;
    margin-top: 0.5rem;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;
  }
  .policies {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .item {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .no-wrap {
    text-wrap: nowrap;
  }
</style>

<div class="delegates txt-small">
  <div class="item" style:height="2rem">
    <div class="item">
      <IconSmall name="badge" />
      <span class="txt-bold">Delegates</span>
      <span class="txt-missing">{project.delegates.length}</span>
    </div>
    <div class="item">
      <IconSmall name="quorum" />
      <span class="txt-bold">
        {project.threshold}/{project.delegates.length}
      </span>
      {#if !disablePopovers}
        <Popover
          popoverPositionBottom="0"
          popoverPositionLeft="2rem"
          popoverPositionRight="-17rem">
          <IconButton slot="toggle" let:toggle on:click={toggle}>
            <IconSmall name="help" />
          </IconButton>

          <div slot="popover">
            {project.threshold} out of {project.delegates.length} delegates have
            to accept changes to be included in the canonical branch.
          </div>
        </Popover>
      {/if}
    </div>
  </div>
  <div class="nids">
    {#each project.delegates as { id: nodeId, alias }}
      <div style:width="fit-content">
        <NodeId {alias} {nodeId} stylePopoverPositionLeft="-0.8rem" />
      </div>
    {/each}
  </div>
</div>
<div class="txt-small node">
  <div class="item no-wrap txt-bold" style="justify-content: flex-start; ">
    {#if isLocal(baseUrl.hostname)}
      <IconSmall name="device" />Local Node
    {:else}
      <IconSmall name="seedling" />{baseUrl.hostname}
    {/if}
  </div>

  <div class="policies">
    <div class="item">
      <div class="item" style="justify-content: flex-start;">
        <IconButton on:click={() => (expandedNode = !expandedNode)}>
          <IconSmall name={`chevron-${expandedNode ? "down" : "right"}`} />
        </IconButton>
        <span class="no-wrap">Seeding Policy</span>
      </div>
      <div class="txt-bold">
        {capitalize(shortSeedingPolicy)}
      </div>
    </div>
    {#if expandedNode && node.config}
      <div style:padding-left="2.3rem">
        <ScopePolicyExplainer
          scope={node.config.scope}
          policy={node.config.policy} />
      </div>
    {/if}
    <div class="item txt-overflow" style:padding-top="0.5rem">
      Radicle version
      <span class="txt-missing txt-overflow txt-monospace" title={node.version}>
        {node.version}
      </span>
    </div>
  </div>
</div>
