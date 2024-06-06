<script lang="ts">
  import type { Scope, Policy } from "@http-client";

  import { capitalize } from "lodash";

  export let scope: Scope;
  export let policy: Policy;
</script>

<style>
  .section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }
</style>

<div class="section">
  Scope:
  <span class="txt-bold">{capitalize(scope)}</span>
</div>
<div class="txt-missing">
  {#if scope === "all"}
    All changes in seeded repositories, made by any peer, will be synced.
  {:else if scope === "followed"}
    Only changes made by explicitly followed peers will be synced.
  {/if}
</div>

<div class="section">
  Policy:
  <span class="txt-bold">{capitalize(policy)}</span>
</div>
<div class="txt-missing">
  {#if policy === "allow"}
    All discovered repositories will get seeded.
  {:else if policy === "block"}
    Only repositories marked as such will get seeded.
  {/if}
</div>
