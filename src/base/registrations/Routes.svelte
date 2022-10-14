<script lang="ts">
  import type { Config } from "@app/config";
  import type { RegistrationsParams } from "@app/router/definitions";
  import type { Session } from "@app/session";

  import ErrorModal from "@app/ErrorModal.svelte";
  import New from "@app/base/registrations/New.svelte";
  import Submit from "@app/base/registrations/Submit.svelte";
  import View from "@app/base/registrations/View.svelte";
  import { navigate } from "@app/router";

  export let session: Session | null;
  export let config: Config;
  export let params: RegistrationsParams;
  export let type: string;
</script>

{#if type === "registrations" && params.view === "form"}
  <New {config} name={params.nameOrDomain} owner={params.owner || null} />
{:else if type === "registrations" && params.view === "submit"}
  {#if session}
    <Submit
      {config}
      name={params.nameOrDomain}
      owner={params.owner || null}
      {session} />
  {:else}
    <ErrorModal
      message={"You must connect your wallet to register"}
      on:close={() => navigate({ type: "register" })} />
  {/if}
{:else if type === "registrations" && params.view === "view"}
  <View {config} domain={params.nameOrDomain} />
{/if}
