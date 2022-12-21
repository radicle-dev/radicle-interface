<script lang="ts">
  import type { RegistrationRoute } from "@app/lib/router/definitions";
  import type { Session } from "@app/lib/session";
  import { unreachable } from "@app/lib/utils";
  import type { Wallet } from "@app/lib/wallet";

  import * as router from "@app/lib/router";

  import New from "@app/views/registrations/New.svelte";
  import Submit from "@app/views/registrations/Submit.svelte";
  import Index from "@app/views/registrations/Index.svelte";
  import View from "@app/views/registrations/View.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";

  export let wallet: Wallet;
  export let activeRoute: RegistrationRoute;
  export let session: Session | null;
</script>

{#if activeRoute.params.view.resource === "validateName"}
  <Index {wallet} />
{:else if activeRoute.params.view.resource === "checkNameAvailability"}
  <New
    {wallet}
    name={activeRoute.params.view.params.nameOrDomain}
    owner={activeRoute.params.view.params.owner} />
{:else if activeRoute.params.view.resource === "register"}
  {#if session}
    <Submit
      {wallet}
      name={activeRoute.params.view.params.nameOrDomain}
      owner={activeRoute.params.view.params.owner}
      {session} />
  {:else}
    <ErrorModal
      message={"You must connect your wallet to register"}
      on:close={() => {
        router.push({
          resource: "registrations",
          params: { view: { resource: "validateName" } },
        });
      }} />
  {/if}
{:else if activeRoute.params.view.resource === "view"}
  <View
    {wallet}
    retry={activeRoute.params.view.params.retry}
    domain={activeRoute.params.view.params.nameOrDomain} />
{:else}
  {unreachable(activeRoute.params.view)}
{/if}
