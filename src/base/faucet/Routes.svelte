<script lang="ts">
  import type { Config } from "@app/config";
  import Index from "@app/base/faucet/Index.svelte";
  import Withdraw from "@app/base/faucet/Withdraw.svelte";
  import type { FaucetParams } from "@app/router/definitions";

  export let config: Config;
  export let params: FaucetParams;
</script>

{#if params.type === "form"}
  <Index {config} />
{:else if params.type === "withdraw" && params.amount}
  <Withdraw {config} amount={params.amount} />
{/if}
