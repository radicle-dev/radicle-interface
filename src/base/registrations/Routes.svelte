<script lang="ts">
  import { navigate } from "@app/router";
  import Index from "@app/base/registrations/Index.svelte";
  import New from "@app/base/registrations/New.svelte";
  import Submit from "@app/base/registrations/Submit.svelte";
  import View from "@app/base/registrations/View.svelte";
  import ErrorModal from "@app/ErrorModal.svelte";
  import type { Wallet } from "@app/wallet";
  import type { Session } from "@app/session";

  export let activeView: string | null;
  export let owner: string | null;
  export let nameOrDomain: string | null;
  export let session: Session | null;
  export let wallet: Wallet;
</script>

{#if activeView === "form" && nameOrDomain}
  <New {wallet} name={nameOrDomain} {owner} />
{:else if activeView === "submit" && nameOrDomain}
  {#if session}
    <Submit {wallet} name={nameOrDomain} {owner} {session} />
  {:else}
    <ErrorModal
      message={"You must connect your wallet to register"}
      on:close={() => navigate("/registrations")} />
  {/if}
{:else if !activeView && nameOrDomain}
  <View {wallet} domain={nameOrDomain} />
{:else}
  <Index {wallet} />
{/if}
