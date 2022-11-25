<script lang="ts">
  import type { Wallet } from "@app/wallet";
  import type { VestingRoute } from "@app/router/definitions";
  import type { Session } from "@app/session";

  import Form from "@app/base/vesting/Form.svelte";
  import View from "@app/base/vesting/View.svelte";

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
