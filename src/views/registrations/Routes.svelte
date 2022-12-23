<script lang="ts">
  import type { RegistrationRoute } from "@app/lib/router/definitions";
  import type { Wallet } from "@app/lib/wallet";

  import { unreachable } from "@app/lib/utils";

  import RegistrationForm from "@app/views/registrations/RegistrationForm.svelte";
  import View from "@app/views/registrations/View.svelte";

  export let wallet: Wallet;
  export let activeRoute: RegistrationRoute;
</script>

{#if activeRoute.params.view.resource === "form"}
  <RegistrationForm {wallet} />
{:else if activeRoute.params.view.resource === "view"}
  <View
    {wallet}
    retry={activeRoute.params.view.params.retry}
    domain={activeRoute.params.view.params.nameOrDomain} />
{:else}
  {unreachable(activeRoute.params.view)}
{/if}
