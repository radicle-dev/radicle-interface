<script lang="ts">
  import type { FaucetRoute } from "@app/lib/router/definitions";

  import Form from "@app/views/faucet/Form.svelte";
  import Withdraw from "@app/views/faucet/Withdraw.svelte";

  export let activeRoute: FaucetRoute;
</script>

{#if activeRoute.params.view.resource === "form"}
  <Form />
{:else if activeRoute.params.view.resource === "withdraw"}
  <Withdraw amount={activeRoute.params.view.params.amount} />
{/if}
