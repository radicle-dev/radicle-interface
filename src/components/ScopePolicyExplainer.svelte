<script lang="ts">
  import type { Scope, Policy } from "@httpd-client";

  export let scope: Scope;
  export let policy: Policy;
</script>

{#if policy === "allow"}
  All discovered repositories will get seeded,
{:else if policy === "block"}
  Only repositories marked as such will get seeded,
{/if}
{#if scope === "all"}
  and all changes in those repositories, made by any peer, will be synced.
{:else if scope === "followed"}
  and only changes made by explicitly followed peers will be synced.
{/if}
