<script lang="ts" context="module">
  export type Params = { type: "form" } | { type: "withdraw" };
</script>

<script lang="ts">
  import type { Config } from "@app/config";
  import Index from "@app/base/faucet/Index.svelte";
  import Withdraw from "@app/base/faucet/Withdraw.svelte";

  export let config: Config;
  export let params: Params;
</script>

{#if params.type === "form"}
  <Index {config} />
{:else if params.type === "withdraw"}
  <Withdraw {config} />
{/if}
