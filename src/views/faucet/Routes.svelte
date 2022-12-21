<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";
  import type { FaucetRoute } from "@app/lib/router/definitions";

  import Form from "@app/views/faucet/Form.svelte";
  import Withdraw from "@app/views/faucet/Withdraw.svelte";

  export let activeRoute: FaucetRoute;
  export let wallet: Wallet;
</script>

{#if activeRoute.params.view.resource === "form"}
  <Form {wallet} />
{:else if activeRoute.params.view.resource === "withdraw"}
  <Withdraw {wallet} amount={activeRoute.params.view.params.amount} />
{/if}
