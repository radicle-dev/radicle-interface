<script lang="typescript">
  import { Route } from "svelte-routing";
  import Orgs from '@app/base/orgs/Orgs.svelte';

  export let config;
  export let query;
</script>

<Route path="/orgs">
  <Orgs {config} />
</Route>
