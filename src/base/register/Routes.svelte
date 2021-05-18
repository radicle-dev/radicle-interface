<script lang="typescript">
  import { Route, navigate } from "svelte-routing";
  import Register from '@app/base/register/Register.svelte';
  import Begin from '@app/base/register/steps/Begin.svelte';
  import Submit from '@app/base/register/steps/Submit.svelte';
  import Registration from '@app/base/register/Registration.svelte';
  import Error from '@app/Error.svelte';
  import type { Config } from '@app/config';
  import type { Session } from '@app/session';
  import { getSearchParam } from '@app/utils';

  export let session: Session | null;
  export let config: Config;
</script>

<Route path="register">
  <Register {config} />
</Route>

<Route path="register/:name" let:params let:location>
  <Begin {config} subdomain={params.name} owner={getSearchParam("owner", location)} />
</Route>

<Route path="register/:name/submit" let:params let:location>
  {#if session}
    <Submit {config} subdomain={params.name} owner={getSearchParam("owner", location)} {session} />
  {:else}
    <Error
      message={"You must connect your wallet to register"}
      on:close={() => navigate("/register")}
    />
  {/if}
</Route>

<Route path="registrations/:name" let:params>
  <Registration {config} subdomain={params.name} />
</Route>
