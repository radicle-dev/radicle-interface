<script lang="typescript">
  import { Route } from "svelte-routing";
  import Orgs from '@app/base/orgs/Orgs.svelte';
  import Profile from '@app/base/orgs/Profile.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/orgs">
  <Orgs {config} />
</Route>

<Route path="/orgs/:id" let:params>
  <Profile {config} id={params.id} />
</Route>
