<script lang="ts">
  import type { Project, SeedingPolicy } from "@http-client";

  import { capitalize } from "lodash";

  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import NodeId from "@app/components/NodeId.svelte";

  export let projectThreshold: number;
  export let projectDelegates: Project["delegates"];
  export let projectSeeds: number;
  export let seedingPolicy: SeedingPolicy;

  let delegateExpanded = false;
  let policyExpanded = false;
</script>

<style>
  .item-header {
    gap: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.2rem 0;
  }
  .item-header:first-child {
    margin-top: 0;
  }
  .item-header:last-child {
    margin-bottom: 0;
  }
  .nid {
    margin: 0.5rem 0;
  }
</style>

<div class="item-header" style:height="2rem">
  <span>Seeds</span>
  <div class="global-flex-item txt-bold" style:padding-right="2.25rem">
    {projectSeeds}
  </div>
</div>
<div class="item-header">
  <span>Delegates</span>
  <div class="global-flex-item">
    <span class="txt-bold">
      {projectThreshold}/{projectDelegates.length}
    </span>
    <IconButton on:click={() => (delegateExpanded = !delegateExpanded)}>
      <IconSmall name={delegateExpanded ? "chevron-up" : "chevron-down"} />
    </IconButton>
  </div>
</div>
{#if delegateExpanded}
  <div style:color="var(--color-foreground-dim" style:margin-bottom="1rem">
    {#if projectDelegates.length === 1}
      Any changes accepted by the sole delegate will be included in the
      canonical branch.
    {:else}
      {projectThreshold} out of {projectDelegates.length} delegates have to accept
      changes to be included in the canonical branch.
    {/if}
  </div>
  {#each projectDelegates as delegate}
    <div class="nid">
      <NodeId nodeId={delegate.id} alias={delegate.alias} />
    </div>
  {/each}
{/if}
<div class="item-header">
  <span style:text-wrap="nowrap">Seeding Scope</span>
  <div class="global-flex-item">
    <span class="txt-bold">
      {capitalize(
        "scope" in seedingPolicy ? seedingPolicy.scope : "not defined",
      )}
    </span>
    <IconButton on:click={() => (policyExpanded = !policyExpanded)}>
      <IconSmall name={policyExpanded ? "chevron-up" : "chevron-down"} />
    </IconButton>
  </div>
</div>
{#if policyExpanded}
  <div style:color="var(--color-foreground-dim)">
    {#if seedingPolicy.policy === "block"}
      Seeding scope only has an effect when a repository is seeded. This repo
      isn't seeded by the seed node.
    {:else if seedingPolicy.scope === "all"}
      This repository tracks changes by any peer.
    {:else}
      This repository tracks only peers followed by the seed node.
    {/if}
  </div>
{/if}
