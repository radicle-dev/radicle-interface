<script lang="ts">
  import { Route } from "svelte-routing";
  import Index from '@app/base/orgs/Index.svelte';
  import View from '@app/base/orgs/View.svelte';
  import type { Config } from '@app/config';
  import { getSearchParam } from '@app/utils';

  export let config: Config;
</script>

<Route path="/orgs">
  <Index {config} />
</Route>

<Route path="/orgs/:address" let:params let:location>
  <View {config} addressOrName={params.address} action={getSearchParam("action", location)} />
</Route>
