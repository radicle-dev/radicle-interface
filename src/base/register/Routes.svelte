<script lang="typescript">
  import { Route, navigate } from "svelte-routing";
  import Register from '@app/base/register/Register.svelte';
  import Begin from '@app/base/register/steps/Begin.svelte';
  import Submit from '@app/base/register/steps/Submit.svelte';
  import Error from '@app/Error.svelte';
  import type { Config } from '@app/config';
  import type { Session } from '@app/session';
  import { Failure } from '@app/error';

  export let session: Session | null;
  export let config: Config;
  export let query: Record<string, any>;
</script>

<Route path="register">
  <Register {config} />
</Route>

<Route path="register/:name" let:params>
  <Begin {config} subdomain={params.name} {query} />
</Route>

<Route path="register/:name/submit" let:params>
  {#if session}
    <Submit {config} subdomain={params.name} {query} {session} />
  {:else}
    <Error
      message={"You must connect your wallet to register"}
      on:close={() => navigate("/register")}
    />
  {/if}
</Route>
