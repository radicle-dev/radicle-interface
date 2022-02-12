<script lang="ts">
  import { Route, Router } from "svelte-routing";
  import type * as proj from "@app/project";
  import type { Config } from "@app/config";
  import { ProjectContent } from "@app/project";
  import ProjectRoute from "./ProjectRoute.svelte";

  export let config: Config;
  export let source: proj.Source;
  export let peer: string | null;
</script>

<Router>
  <!-- The default action is to render Browser with the default branch head -->
  <Route path="/">
    <ProjectRoute content={ProjectContent.Tree} {peer} {source} {config} />
  </Route>
  <Route path="/tree">
    <ProjectRoute content={ProjectContent.Tree} {peer} {source} {config} />
  </Route>
  <Route path="/tree/*" let:params>
    <ProjectRoute route={params["*"]} content={ProjectContent.Tree} {peer} {source} {config} />
  </Route>

  <Route path="/history">
    <ProjectRoute content={ProjectContent.History} {peer} {source} {config} />
  </Route>
  <Route path="/history/*" let:params>
    <ProjectRoute route={params["*"]} content={ProjectContent.History} {peer} {source} {config} />
  </Route>

  <Route path="/commits/:commit" let:params>
    <ProjectRoute revision={params.commit} content={ProjectContent.Commit} {peer} {source} {config} />
  </Route>
  <Route path="/commits/*" let:params>
    <ProjectRoute route={params["*"]} content={ProjectContent.Commit} {peer} {source} {config} />
  </Route>
</Router>
