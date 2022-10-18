<script lang="ts">
  import type { Config } from "@app/config";
  import type { Session } from "@app/session";

  import ErrorModal from "@app/ErrorModal.svelte";
  import New from "@app/base/registrations/New.svelte";
  import Submit from "@app/base/registrations/Submit.svelte";
  import View from "@app/base/registrations/View.svelte";
  import { navigate } from "@app/router";
  import Index from "@app/base/registrations/Index.svelte";

  export let activeView: string | null;
  export let owner: string | null;
  export let nameOrDomain: string | null;
  export let session: Session | null;
  export let config: Config;
</script>

{#if activeView === "form" && nameOrDomain}
  <New {config} name={nameOrDomain} {owner} />
{:else if activeView === "submit" && nameOrDomain}
  {#if session}
    <Submit {config} name={nameOrDomain} {owner} {session} />
  {:else}
    <ErrorModal
      message={"You must connect your wallet to register"}
      on:close={() => navigate("/registrations")} />
  {/if}
{:else if !activeView && nameOrDomain}
  <View {config} domain={nameOrDomain} />
{:else}
  <Index {config} />
{/if}
