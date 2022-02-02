<script lang="ts">
  import { Route } from "svelte-routing";
  import Index from '@app/base/orgs/Index.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/orgs">
  <Index {config} />
</Route>
