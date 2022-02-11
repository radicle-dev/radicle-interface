<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Route, Router } from "svelte-routing";
  import type * as proj from "@app/project";
  import { ProjectContent } from "@app/project";
  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";
  import RouteContext from "./RouteContext.svelte";

  export let source: proj.Source;
  export let tree: proj.Tree;
  export let browserStore: Writable<proj.Browser>;
  export let peer: string | null;
  export let branches: proj.Branches;

  const project = source.project;
</script>

<Router>
  <!-- The default action is to render Browser with the default branch head -->
  <Route path="/">
    <RouteContext {browserStore} {peer} {branches} {project}>
      <Browser {source} {tree} {browserStore} />
    </RouteContext>
  </Route>
  <Route path="/tree">
    <RouteContext {browserStore} {peer} {branches} {project}>
      <Browser {source} {tree} {browserStore} />
    </RouteContext>
  </Route>
  <Route path="/tree/*" let:params>
    <RouteContext route={params["*"]} {browserStore} {peer} {branches} {project}>
      <Browser {source} {tree} {browserStore} />
    </RouteContext>
  </Route>
  <Route path="/history">
    <RouteContext {browserStore} content={ProjectContent.History} {peer} {branches} {project} let:commit>
      {#if commit}
        <History {source} {commit} />
      {/if}
    </RouteContext>
  </Route>
  <Route path="/history/*" let:params>
    <RouteContext route={params["*"]} {browserStore} content={ProjectContent.History} {peer} {branches} {project} let:commit>
      {#if commit}
        <History {source} {commit} />
      {/if}
    </RouteContext>
  </Route>
  <Route path="/commits/:commit" let:params>
    <RouteContext revision={params.commit} {browserStore} {project} content={ProjectContent.Commit} {peer} {branches} let:revision>
      {#if revision}
        <Commit {source} commit={revision} />
      {/if}
    </RouteContext>
  </Route>
  <Route path="/commits/*" let:params>
    <RouteContext route={params["*"]} {browserStore} {project} content={ProjectContent.Commit} {peer} {branches} let:revision>
      {#if revision}
        <Commit {source} commit={revision} />
      {/if}
    </RouteContext>
  </Route>
</Router>
