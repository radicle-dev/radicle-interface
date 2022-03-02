<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';
  import Redirect from "@app/Redirect.svelte";

  export let config: Config;
</script>

<!-- With a seed context -->

<Route path="/seeds/:seed/:id/*" let:params>
  <View {config} seedHost={params.seed} id={params.id} />
</Route>

<Route path="/seeds/:seed/:id/remotes/:peer/*" let:params>
  <View {config} seedHost={params.seed} peer={params.peer} id={params.id} />
</Route>

<!-- Explicit user and org context, will at some point be replaced by the generic route -->
<Route path="/orgs/:addressOrName/projects/:id/*" let:params>
  <Redirect to="/{params.addressOrName}/{params.id}/{params["*"]}" />
</Route>

<Route path="/users/:addressOrName/projects/:id/*" let:params>
  <Redirect to="/{params.addressOrName}/{params.id}/{params["*"]}" />
</Route>
<!-- End of eventual dropped routes -->

<Route path="/:profile/:id/remotes/:peer/*" let:params>
  <View {config} profileName={params.profile} id={params.id} peer={params.peer} />
</Route>

<Route path="/:profile/:id/*" let:params>
  <View {config} profileName={params.profile} id={params.id} />
</Route>
