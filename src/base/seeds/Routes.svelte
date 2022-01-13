<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/seeds/View.svelte';
  import ProjectView from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/seeds/:seed" let:params>
  <View {config} seedAddress={params.seed}/>
</Route>

<Route path="/seeds/:seed/projects/:urn/*" let:params>
  <ProjectView {config} urn={params.urn} seed_={params.seed} />
</Route>
