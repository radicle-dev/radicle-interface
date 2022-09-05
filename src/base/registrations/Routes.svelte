<script lang="ts">
  import { Route } from "tinro";
  import Index from "@app/base/registrations/Index.svelte";
  import New from "@app/base/registrations/New.svelte";
  import Submit from "@app/base/registrations/Submit.svelte";
  import View from "@app/base/registrations/View.svelte";
  import Error from "@app/Error.svelte";
  import type { Config } from "@app/config";
  import type { Session } from "@app/session";
  import { getSearchParam } from "@app/utils";

  export let session: Session | null;
  export let config: Config;
</script>

<Route path="/">
  <Index {config} />
</Route>

<Route path="/:domain" let:meta>
  <View {config} domain={meta.params.domain} />
</Route>

<Route path="/:domain/form" let:meta>
  <New
    {config}
    name={meta.params.domain}
    owner={getSearchParam("owner", meta.query)} />
</Route>

<Route path="/:domain/submit" let:meta>
  {#if session}
    <Submit
      {config}
      name={meta.params.domain}
      owner={getSearchParam("owner", meta.query)}
      {session} />
  {:else}
    <Error message={"You must connect your wallet to register"} />
  {/if}
</Route>
