<script lang="ts">
  import type { Policy, Scope } from "@http-client";

  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Id from "@app/components/Id.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";
  import { capitalize } from "lodash";

  export let version: string;
  export let policy: Policy | undefined = undefined;
  export let scope: Scope | undefined = undefined;

  let expandedNode = false;

  $: shortSeedingPolicy =
    scope === "all" && policy === "allow" ? "permissive" : "restrictive";
</script>

<style>
  .version {
    color: var(--color-fill-gray);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
  }
  .policies {
    font-size: var(--font-size-small);
    display: flex;
    flex-direction: column;
  }
  .item {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
</style>

<div class="policies">
  <div class="item">
    <div class="item" style="justify-content: flex-start;">
      <span class="no-wrap">Seeding Policy</span>
    </div>
    <div
      style="display: flex; flex-direction: row; gap: 0.5rem; align-items: center;">
      <div class="txt-bold">
        {capitalize(shortSeedingPolicy)}
      </div>
      <IconButton on:click={() => (expandedNode = !expandedNode)}>
        <IconSmall name={`chevron-${expandedNode ? "down" : "right"}`} />
      </IconButton>
    </div>
  </div>
  {#if expandedNode && scope && policy}
    <div style:padding="0 0 1rem 1rem">
      <ScopePolicyExplainer {scope} {policy} />
    </div>
  {/if}
</div>
<div
  class="item"
  style="justify-content: space-between; display: flex; text-wrap: nowrap; font-size: var(--font-size-small); ">
  <span>Radicle version</span>
  <Id id={version} ariaLabel="node-id" shorten={false}>
    <div class="version" style="width: 10rem;">
      <div class="txt-overflow">{version}</div>
    </div>
  </Id>
</div>
