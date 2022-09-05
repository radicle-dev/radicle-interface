<script lang="ts">
  import { Route } from "tinro";
  import SeedView from "@app/base/seeds/View.svelte";
  import ProjectView from "@app/base/projects/View.svelte";
  import type { Config } from "@app/config";
  import type { Session } from "@app/session";

  export let config: Config;
  export let session: Session | null;
</script>

<Route path="/radicle.local">
  <SeedView {config} {session} host={"0.0.0.0"} />
</Route>

<Route path="/:seed" let:meta>
  <SeedView {config} {session} host={meta.params.seed} />
</Route>

<Route path="/:seed/:id/*" let:meta firstmatch>
  <Route path="/remotes/:peer/*" let:meta>
    <ProjectView
      {config}
      seedHost={meta.params.seed}
      peer={meta.params.peer}
      id={meta.params.id} />
  </Route>
  <Route path="/*">
    <ProjectView {config} seedHost={meta.params.seed} id={meta.params.id} />
  </Route>
</Route>
