<script lang="typescript">
  import { Route } from "svelte-routing";
  import View from '@app/base/users/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/users/:address" let:params>
  <View {config} address={params.address}/>
</Route>
