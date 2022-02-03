<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

</script>

<!-- With an Seed context -->

<Route path="/seeds/:seed/projects/:id/*" let:params>
  <View {config} seed={params.seed} id={params.id} />
</Route>

<Route path="/seeds/:seed/projects/:id/remotes/:peer/*" let:params>
  <View {config} seed={params.seed} peer={params.peer} id={params.id} />
</Route>

<!-- With an Org context -->

<Route path="/orgs/:org/projects/:id/*" let:params>
  <View {config} org={params.org} id={params.id} />
</Route>

<!-- With a User context -->

<Route path="/users/:user/projects/:id/*" let:params>
  <View {config} user={params.user} id={params.id} />
</Route>
