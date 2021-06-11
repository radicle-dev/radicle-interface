<script lang="typescript">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

  const joinPaths = (path: string, glob: string): string => {
    return glob.length > 0 ? [path, glob].join("/") : path;
  };
</script>

<Route path="/projects/:urn/head/:path/*" let:params>
  <View {config} urn={params.urn} path={joinPaths(params.path, params['*'])} />
</Route>

<Route path="/projects/:urn/:commit/:path/*" let:params>
  <View {config} urn={params.urn} commit={params.commit} path={joinPaths(params.path, params['*'])} />
</Route>

<Route path="/projects/:urn/:commit" let:params>
  <View {config} urn={params.urn} commit={params.commit} path="/" />
</Route>

<Route path="/projects/:urn/head" let:params>
  <View {config} urn={params.urn} path="/" />
</Route>

<Route path="/projects/:urn" let:params>
  <View {config} urn={params.urn} path="/" />
</Route>

<!-- With an Org context -->

<Route path="/orgs/:org/projects/:urn/head/:path/*" let:params>
  <View {config} org={params.org} urn={params.urn} path={joinPaths(params.path, params['*'])} />
</Route>

<Route path="/orgs/:org/projects/:urn/:commit/:path/*" let:params>
  <View {config} org={params.org} urn={params.urn} commit={params.commit} path={joinPaths(params.path, params['*'])} />
</Route>

<Route path="/orgs/:org/projects/:urn/:commit" let:params>
  <View {config} org={params.org} urn={params.urn} commit={params.commit} path="/" />
</Route>

<Route path="/orgs/:org/projects/:urn/head" let:params>
  <View {config} org={params.org} urn={params.urn} path="/" />
</Route>

<Route path="/orgs/:org/projects/:urn" let:params>
  <View {config} org={params.org} urn={params.urn} path="/" />
</Route>
