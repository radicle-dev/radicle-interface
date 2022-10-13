<script lang="ts" context="module">
  export interface Params {
    nameOrDomain: string;
    owner: string | null;
    view: string;
  }
</script>

<script lang="ts">
  import { navigate } from "@app/router";
  import New from "@app/base/registrations/New.svelte";
  import Submit from "@app/base/registrations/Submit.svelte";
  import View from "@app/base/registrations/View.svelte";
  import ErrorModal from "@app/ErrorModal.svelte";
  import type { Config } from "@app/config";
  import type { Session } from "@app/session";

  export let session: Session | null;
  export let config: Config;
  export let params: Params;
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
