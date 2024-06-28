<script lang="ts">
  import type { DefaultSeedingPolicy } from "@http-client";

  import { capitalize } from "lodash";

  export let seedingPolicy: DefaultSeedingPolicy;
</script>

<style>
  .section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }
</style>

{#if seedingPolicy.default === "allow"}
  <div class="section">
    Scope:
    <span class="txt-bold">{capitalize(seedingPolicy.scope)}</span>
  </div>
  <div class="txt-missing">
    {#if seedingPolicy.scope === "all"}
      All changes in seeded repositories, made by any peer, will be synced.
    {:else if seedingPolicy.scope === "followed"}
      Only changes made by explicitly followed peers will be synced.
    {/if}
  </div>
{/if}

<div class="section">
  Policy:
  <span class="txt-bold">{capitalize(seedingPolicy.default)}</span>
</div>
<div class="txt-missing">
  {#if seedingPolicy.default === "allow"}
    All discovered repositories will get seeded.
  {:else if seedingPolicy.default === "block"}
    Only repositories marked as such will get seeded.
  {/if}
</div>
