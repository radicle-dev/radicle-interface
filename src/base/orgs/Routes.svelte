<script lang="ts">
  import { Route } from "svelte-routing";
  import Index from '@app/base/orgs/Index.svelte';
  import type { Config } from '@app/config';
  import View from "@app/base/orgs/View.svelte";

  export let config: Config;
</script>

<Route path="/orgs">
  <Index {config} />
</Route>

<Route path="/orgs/:addressOrName" let:params>
  <View {config} addressOrName={params.addressOrName} />
</Route>
