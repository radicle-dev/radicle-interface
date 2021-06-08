<script lang="typescript">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

  const joinPaths = (path: string, glob: string): string => {
    return glob.length > 0 ? [path, glob].join("/") : path;
  };
</script>

<Route path="/projects/:urn/:commit/:path/*" let:params>
  <View {config} urn={params.urn} commit={params.commit} path={joinPaths(params.path, params['*'])} />
</Route>

<Route path="/projects/:urn/:commit" let:params>
  <View {config} urn={params.urn} commit={params.commit} path="/" />
</Route>
