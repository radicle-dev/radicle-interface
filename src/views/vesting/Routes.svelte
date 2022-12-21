<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";
  import type { VestingRoute } from "@app/lib/router/definitions";
  import type { Session } from "@app/lib/session";

  import Form from "./Form.svelte";
  import View from "./View.svelte";

  export let activeRoute: VestingRoute;
  export let wallet: Wallet;
  export let session: Session | null;
</script>

{#if activeRoute.params.view.resource === "form"}
  <Form {wallet} />
{:else if activeRoute.params.view.resource === "view"}
  <View
    {wallet}
    {session}
    info={activeRoute.params.view.params.info}
    contractAddress={activeRoute.params.view.params.contract} />
{/if}
