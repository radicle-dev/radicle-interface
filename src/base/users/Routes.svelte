<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/users/View.svelte';
  import type { Config } from '@app/config';
  import { getSearchParam } from '@app/utils';

  export let config: Config;
</script>

<Route path="/users/:address" let:params let:location>
  <View {config} addressOrName={params.address} action={getSearchParam("action", location)} />
</Route>
