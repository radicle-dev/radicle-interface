<script lang="typescript">
  import { Route } from "svelte-routing";
  import Index from '@app/base/orgs/Index.svelte';
  import View from '@app/base/orgs/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/orgs">
  <Index {config} />
</Route>

<Route path="/orgs/:address" let:params>
  <View {config} address={params.address} />
</Route>
