<script lang="ts">
  import type { Config } from "@app/config";
  import type { Info, ProjectContent, Tree } from "@app/project";
  import { Route, Router } from "svelte-routing";
  import Browser from "./Browser.svelte";
  import History from "./Commit/History.svelte";

  export let urn: string;
  export let project: Info;
  export let config: Config;
  export let org: string;
  export let tree: Tree;
  export let user: string;
  export let branches: [string, string][];
  export let content: ProjectContent;
</script>

<Router>
  <!-- The default action is to render Browser with the default branch head -->
  <Route path="/">
    <Browser {urn} {org} {user} {config} {tree} {project} {branches}
      locator={project.head}
      bind:content={content}
      on:routeParamsChange />
  </Route>
  <Route path="/tree">
    <Browser {urn} {org} {user} {config} {tree} {project} {branches}
      locator={project.head}
      bind:content={content}
      on:routeParamsChange />
  </Route>
  <Route path="/tree/*" let:params>
    <Browser {urn} {org} {user} {config} {tree} {project} {branches}
      locator={params["*"]}
      bind:content={content}
      on:routeParamsChange />
  </Route>
  <Route path="/history">
    <History {urn} locator={project.head} {config} {project} {branches}
      bind:content={content}
      on:routeParamsChange />
  </Route>
  <Route path="/history/*" let:params>
    <History {urn} locator={params["*"]} {config} {project} {branches}
      bind:content={content}
      on:routeParamsChange />
  </Route>
</Router>
