<script lang="ts">
  import { Route } from "svelte-routing";
  import Index from '@app/base/orgs/Index.svelte';
  import type { Config } from '@app/config';
  import Redirect from "@app/Redirect.svelte";

  export let config: Config;
</script>

<Route path="/orgs">
  <Index {config} />
</Route>

<Route path="/orgs/:addressOrName" let:params>
  <Redirect to="/{params.addressOrName}" />
</Route>
