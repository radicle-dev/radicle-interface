<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";
  import type { VestingRoute } from "@app/lib/router/definitions";

  import Form from "@app/views/vesting/Form.svelte";
  import Profile from "@app/views/profiles/Profile.svelte";

  export let activeRoute: VestingRoute;
  export let wallet: Wallet;
</script>

{#if activeRoute.params.view.resource === "form"}
  <Form {wallet} />
{:else if activeRoute.params.view.resource === "view"}
  <Profile {wallet} addressOrName={activeRoute.params.view.params.contract} />
{/if}
