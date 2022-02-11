<script lang="ts">
  import { Route, Router } from "svelte-routing";
  import type * as proj from "@app/project";
  import type { Config } from "@app/config";
  import { ProjectContent } from "@app/project";
  import RouteContext from "./RouteContext.svelte";

  export let config: Config;
  export let source: proj.Source;
  export let peer: string | null;
</script>

<Router>
  <!-- The default action is to render Browser with the default branch head -->
  <Route path="/">
    <RouteContext content={ProjectContent.Tree} {peer} {source} {config} />
  </Route>
  <Route path="/tree">
    <RouteContext content={ProjectContent.Tree} {peer} {source} {config} />
  </Route>
  <Route path="/tree/*" let:params>
    <RouteContext route={params["*"]} content={ProjectContent.Tree} {peer} {source} {config} />
  </Route>

  <Route path="/history">
    <RouteContext content={ProjectContent.History} {peer} {source} {config} />
  </Route>
  <Route path="/history/*" let:params>
    <RouteContext route={params["*"]} content={ProjectContent.History} {peer} {source} {config} />
  </Route>

  <Route path="/commits/:commit" let:params>
    <RouteContext revision={params.commit} content={ProjectContent.Commit} {peer} {source} {config} />
  </Route>
  <Route path="/commits/*" let:params>
    <RouteContext route={params["*"]} content={ProjectContent.Commit} {peer} {source} {config} />
  </Route>
</Router>
