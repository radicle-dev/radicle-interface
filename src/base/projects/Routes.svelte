<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

</script>

<!-- With an Seed context -->

<Route path="/seeds/:seed/:id/*" let:params>
  <View {config} seed={params.seed} id={params.id} />
</Route>

<Route path="/seeds/:seed/:id/remotes/:peer/*" let:params>
  <View {config} seed={params.seed} peer={params.peer} id={params.id} />
</Route>

<!-- With User or Org context -->

<Route path="/:addressOrName/:id/*" let:params>
  <View {config} addressOrName={params.addressOrName} id={params.id} />
</Route>
