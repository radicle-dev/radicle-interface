<script lang="ts">
  import Index from "@app/base/faucet/Index.svelte";
  import type { Wallet } from "@app/wallet";
  import Withdraw from "./Withdraw.svelte";

  export let wallet: Wallet;
  export let activeView: string;
  export let amount: string | null;
</script>

{#if activeView === "form"}
  <Index {wallet} />
{:else if activeView === "withdraw" && amount}
  <Withdraw {wallet} {amount} />
{/if}
