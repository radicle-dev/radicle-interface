<script lang="ts">
  import type { Config } from "@app/config";
  import type { Info, Peer, ProjectContent, Tree } from "@app/project";
  import { Route, Router } from "svelte-routing";
  import Browser from "./Browser.svelte";
  import History from "./Commit/History.svelte";

  export let urn: string;
  export let project: Info;
  export let config: Config;
  export let org: string;
  export let tree: Tree;
  export let user: string;
  export let seed: string;
  export let peer: Peer;
  export let branches: [string, string][];
  export let content: ProjectContent;
  export let revision: string;
  export let path: string;
</script>

<Router>
  <!-- The default action is to render Browser with the default branch head -->
  <Route path="/">
    <Browser {urn} {org} {user} {seed} {config} {tree} {project} {branches} {peer}
      locator={project.head}
      bind:content={content}
      bind:path={path}
      bind:revision={revision} />
  </Route>
  <Route path="/tree">
    <Browser {urn} {org} {user} {seed} {config} {tree} {project} {branches} {peer}
      locator={project.head}
      bind:content={content}
      bind:path={path}
      bind:revision={revision} />
  </Route>
  <Route path="/tree/*" let:params>
    <Browser {urn} {org} {user} {seed} {config} {tree} {project} {branches} {peer}
      locator={params["*"]}
      bind:content={content}
      bind:path={path}
      bind:revision={revision} />
  </Route>
  <Route path="/history">
    <History {urn} locator={project.head} {config} {project} {branches}
      bind:content={content}
      bind:revision={revision} />
  </Route>
  <Route path="/history/*" let:params>
    <History {urn} locator={params["*"]} {config} {project} {branches}
      bind:content={content}
      bind:revision={revision} />
  </Route>
</Router>
