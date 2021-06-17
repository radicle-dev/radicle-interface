<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/projects/:urn/head/*" let:params>
  <View {config} urn={params.urn} path={params['*'] || "/"} />
</Route>

<Route path="/projects/:urn/:commit/*" let:params>
  <View {config} urn={params.urn} commit={params.commit} path={params['*'] || "/"} />
</Route>

<Route path="/projects/:urn" let:params>
  <View {config} urn={params.urn} path="/" />
</Route>

<!-- With an Org context -->

<Route path="/orgs/:org/projects/:urn/head/*" let:params>
  <View {config} org={params.org} urn={params.urn} path={params['*'] || "/"} />
</Route>

<Route path="/orgs/:org/projects/:urn/:commit/*" let:params>
  <View {config} org={params.org} urn={params.urn} commit={params.commit} path={params["*"] || "/"} />
</Route>

<Route path="/orgs/:org/projects/:urn" let:params>
  <View {config} org={params.org} urn={params.urn} path="/" />
</Route>
