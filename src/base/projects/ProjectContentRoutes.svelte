<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Config } from "@app/config";
  import type { Info, Tree } from "@app/project";
  import { Route, Router } from "svelte-routing";
  import Browser from "./Browser.svelte";
  import History from "./Commit/History.svelte";

  export let urn: string;
  export let project: Info;
  export let config: Config;
  export let org: string;
  export let tree: Tree;
  export let path: string;
  export let user: string;
  export let branches: [string, string][];

  const dispatch = createEventDispatcher();

  function forwardRouteParams({ detail: newParams }: { detail: any }) {
    dispatch("routeParamsChange", newParams);
  }
</script>

<Router>
  <!-- The default action is to render Browser with the default branch head -->
  <Route path="/">
    <Browser {urn} {org} {user} {config} {tree} {project} {branches}
      path={"/"}
      revision={project.head}
      on:routeParamsChange={forwardRouteParams} />
  </Route>
  <Route path="/tree">
    <Browser {urn} {org} {user} {config} {tree} {project} {branches}
      path={"/"}
      revision={project.head}
      on:routeParamsChange={forwardRouteParams} />
  </Route>
  <Route path="/tree/*" let:params>
    <Browser {urn} {org} {user} {config} {tree} {project} {branches} {path}
      revision={params["*"]}
      on:routeParamsChange={forwardRouteParams} />
  </Route>
  <Route path="/history">
    <History {urn} revision={project.head} {config} {project} {branches}
      on:routeParamsChange={forwardRouteParams} />
  </Route>
  <Route path="/history/*" let:params>
    <History {urn} revision={params["*"]} {config} {project} {branches}
      on:routeParamsChange={forwardRouteParams} />
  </Route>
</Router>
