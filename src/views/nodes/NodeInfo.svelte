<script lang="ts">
  import type { DefaultSeedingPolicy } from "@http-client";

  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Id from "@app/components/Id.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";
  import { capitalize } from "lodash";
  import { formatUserAgent } from "@app/lib/utils";

  export let agent: string;
  export let seedingPolicy: DefaultSeedingPolicy | undefined = undefined;

  let expandedNode = false;

  $: shortScope =
    seedingPolicy?.default === "allow" && seedingPolicy?.scope === "all"
      ? "permissive"
      : "restrictive";
</script>

<style>
  .agent {
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
        {capitalize(shortScope)}
      </div>
      <IconButton on:click={() => (expandedNode = !expandedNode)}>
        <IconSmall name={`chevron-${expandedNode ? "down" : "right"}`} />
      </IconButton>
    </div>
  </div>
  {#if expandedNode && seedingPolicy}
    <div style:padding="0 0 1rem 1rem">
      <ScopePolicyExplainer {seedingPolicy} />
    </div>
  {/if}
</div>
<div
  class="item"
  style="justify-content: space-between; display: flex; text-wrap: nowrap; font-size: var(--font-size-small); ">
  <span>Radicle version</span>
  <Id
    ariaLabel="agent"
    id={formatUserAgent(agent)}
    shorten={false}
    style="none">
    <div class="agent" style="width: 10rem;">
      <div class="txt-overflow">{formatUserAgent(agent)}</div>
    </div>
  </Id>
</div>
