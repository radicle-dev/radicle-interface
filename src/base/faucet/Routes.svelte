<script lang="ts">
  import type { Wallet } from "@app/wallet";
  import type { FaucetRoute } from "@app/router/definitions";

  import Index from "@app/base/faucet/Index.svelte";
  import Withdraw from "./Withdraw.svelte";

  export let wallet: Wallet;
  export let activeView: FaucetRoute;
</script>

{#if activeView.type === "form"}
  <Index {wallet} />
{:else if activeView.type === "withdraw"}
  <Withdraw {wallet} amount={activeView.params.amount} />
{/if}
