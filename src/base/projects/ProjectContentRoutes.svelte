<script lang="ts">
  import type { ProjectContent, Source, Tree } from "@app/project";
  import { Route, Router } from "svelte-routing";
  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";

  export let source: Source;
  export let tree: Tree;
  export let content: ProjectContent;
  export let revision: string;
  export let path: string;

  let locator = source.anchors[0] || source.project.head;
</script>

<Router>
  <!-- The default action is to render Browser with the default branch head -->
  <Route path="/">
    <Browser {source} {tree} {locator}
      bind:content={content}
      bind:path={path}
      bind:revision={revision} />
  </Route>
  <Route path="/tree">
    <Browser {source} {tree} {locator}
      bind:content={content}
      bind:path={path}
      bind:revision={revision} />
  </Route>
  <Route path="/tree/*" let:params>
    <Browser {source} {tree} locator={params["*"]}
      bind:content={content}
      bind:path={path}
      bind:revision={revision} />
  </Route>
  <Route path="/history">
    <History {locator} {source} {path}
      bind:content={content}
      bind:revision={revision} />
  </Route>
  <Route path="/history/*" let:params>
    <History locator={params["*"]} {source} {path}
      bind:content={content}
      bind:revision={revision} />
  </Route>
  <Route path="/commit/:commit" let:params>
    <Commit {source} locator={params.commit}
      bind:content={content}
      bind:revision={revision} />
  </Route>
  <Route path="/commit/*" let:params>
    <Commit {source} locator={params["*"]}
      bind:content={content}
      bind:revision={revision} />
  </Route>
</Router>
