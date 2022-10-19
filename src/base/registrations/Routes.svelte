<script lang="ts">
  import { Route, navigate } from "svelte-routing";
  import Index from "@app/base/registrations/Index.svelte";
  import New from "@app/base/registrations/New.svelte";
  import Submit from "@app/base/registrations/Submit.svelte";
  import View from "@app/base/registrations/View.svelte";
  import ErrorModal from "@app/ErrorModal.svelte";
  import type { Wallet } from "@app/wallet";
  import type { Session } from "@app/session";
  import { getSearchParam } from "@app/utils";

  export let session: Session | null;
  export let wallet: Wallet;
</script>

<Route path="registrations">
  <Index {wallet} />
</Route>

<Route path="registrations/:name/form" let:params let:location>
  <New {wallet} name={params.name} owner={getSearchParam("owner", location)} />
</Route>

<Route path="registrations/:name/submit" let:params let:location>
  {#if session}
    <Submit
      {wallet}
      name={params.name}
      owner={getSearchParam("owner", location)}
      {session} />
  {:else}
    <ErrorModal
      message={"You must connect your wallet to register"}
      on:close={() => navigate("/registrations")} />
  {/if}
</Route>

<Route path="registrations/:domain" let:params>
  <View {wallet} domain={params.domain} />
</Route>
