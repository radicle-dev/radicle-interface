<script lang="ts">
  import type { RegistrationRoute } from "@app/lib/router/definitions";

  import * as router from "@app/lib/router";
  import { unreachable } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";

  import New from "@app/views/registrations/New.svelte";
  import Submit from "@app/views/registrations/Submit.svelte";
  import Index from "@app/views/registrations/Index.svelte";
  import View from "@app/views/registrations/View.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";

  export let activeRoute: RegistrationRoute;
</script>

{#if activeRoute.params.view.resource === "validateName"}
  <Index />
{:else if activeRoute.params.view.resource === "checkNameAvailability"}
  <New
    name={activeRoute.params.view.params.nameOrDomain}
    owner={activeRoute.params.view.params.owner} />
{:else if activeRoute.params.view.resource === "register"}
  {#if $sessionStore}
    <Submit
      name={activeRoute.params.view.params.nameOrDomain}
      owner={activeRoute.params.view.params.owner}
      session={$sessionStore} />
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
    retry={activeRoute.params.view.params.retry}
    domain={activeRoute.params.view.params.nameOrDomain} />
{:else}
  {unreachable(activeRoute.params.view)}
{/if}
