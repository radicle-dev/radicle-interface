<script lang="typescript">
  import { Route } from "svelte-routing";
  import Register from '@app/base/register/Register.svelte';
  import Begin from '@app/base/register/steps/Begin.svelte';
  import Submit from '@app/base/register/steps/Submit.svelte';

  export let config;
  export let query;
</script>

<Route path="register">
  <Register {config} />
</Route>

<Route path="register/:name" let:params>
  <Begin {config} subdomain={params.name} {query} />
</Route>

<Route path="register/:name/submit" let:params>
  <Submit {config} subdomain={params.name} {query} />
</Route>
