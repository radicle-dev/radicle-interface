<script lang="ts">
  import Plausible from "plausible-tracker";

  import * as router from "@app/lib/router";
  import * as httpd from "@app/lib/httpd";
  import { unreachable } from "@app/lib/utils";

  import Header from "./App/Header.svelte";
  import Hotkeys from "./App/Hotkeys.svelte";
  import LoadingBar from "./App/LoadingBar.svelte";
  import ModalPortal from "./App/ModalPortal.svelte";

  import Commit from "@app/views/projects/Commit.svelte";
  import History from "@app/views/projects/History.svelte";
  import Home from "@app/views/home/Index.svelte";
  import Issue from "@app/views/projects/Issue.svelte";
  import Issues from "@app/views/projects/Issues.svelte";
  import NewIssue from "@app/views/projects/Issue/New.svelte";
  import Nodes from "@app/views/nodes/View.svelte";
  import NotFound from "@app/views/NotFound.svelte";
  import Patch from "@app/views/projects/Patch.svelte";
  import Patches from "@app/views/projects/Patches.svelte";
  import Session from "@app/views/session/Index.svelte";
  import Source from "@app/views/projects/Source.svelte";

  import LoadError from "@app/components/LoadError.svelte";
  import Loading from "@app/components/Loading.svelte";

  const activeRouteStore = router.activeRouteStore;

  void router.loadFromLocation();
  httpd.initialize();

  if (!window.VITEST && !window.PLAYWRIGHT && import.meta.env.PROD) {
    const plausible = Plausible({
      domain: "app.radicle.xyz",
      hashMode: import.meta.env.VITE_HASH_ROUTING,
    });

    plausible.enableAutoPageviews();
  }
</script>

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-background-default);
    background-repeat: no-repeat;
    background-size: 100% 6rem;
  }
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 100%;
  }
</style>

{#if $activeRouteStore.resource !== "booting"}
  <LoadingBar />
{/if}

<ModalPortal />
<Hotkeys />

<div class="app">
  <Header />
  <div class="wrapper">
    {#if $activeRouteStore.resource === "booting"}
      <Loading />
    {:else if $activeRouteStore.resource === "home"}
      <Home {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "nodes"}
      <Nodes {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "session"}
      <Session activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "project.source"}
      <Source {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "project.history"}
      <History {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "project.commit"}
      <Commit {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "project.issues"}
      <Issues {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "project.newIssue"}
      <NewIssue {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "project.issue"}
      <Issue {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "project.patches"}
      <Patches {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "project.patch"}
      <Patch {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "loadError"}
      <LoadError {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "notFound"}
      <NotFound {...$activeRouteStore.params} />
    {:else}
      {unreachable($activeRouteStore)}
    {/if}
  </div>
</div>
