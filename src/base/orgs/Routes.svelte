<script lang="typescript">
  import { Route } from "svelte-routing";
  import Orgs from '@app/base/orgs/Orgs.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/orgs">
  <Orgs {config} />
</Route>
