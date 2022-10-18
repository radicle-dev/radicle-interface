<script lang="ts">
  import type { Config } from "@app/config";
  import Index from "@app/base/faucet/Index.svelte";
  import Withdraw from "@app/base/faucet/Withdraw.svelte";

  export let config: Config;
  export let activeView: string;
  export let amount: string | null;
</script>

{#if activeView === "form"}
  <Index {config} />
{:else if activeView === "withdraw" && amount}
  <Withdraw {config} {amount} />
{/if}
