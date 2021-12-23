<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

</script>

<Route path="/projects/:urn/*" let:params>
  <View {config} urn={params.urn} />
</Route>

<!-- With an Org context -->

<Route path="/orgs/:org/projects/:urn/*" let:params>
  <View {config} org={params.org} urn={params.urn} />
</Route>

<!-- With a User context -->

<Route path="/users/:user/projects/:urn/*" let:params>
  <View {config} user={params.user} urn={params.urn} />
</Route>
