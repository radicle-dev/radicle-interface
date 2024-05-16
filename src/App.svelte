<script lang="ts">
  import Plausible from "plausible-tracker";

  import * as router from "@app/lib/router";
  import * as httpd from "@app/lib/httpd";
  import { unreachable } from "@app/lib/utils";

  import { codeFont, theme } from "@app/lib/appearance";

  import FullscreenModalPortal from "./App/FullscreenModalPortal.svelte";
  import Hotkeys from "./App/Hotkeys.svelte";
  import LoadingBar from "./App/LoadingBar.svelte";

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

  import Error from "@app/views/error/View.svelte";
  import Loading from "@app/components/Loading.svelte";

  const activeRouteStore = router.activeRouteStore;

  void httpd.initialize().finally(() => void router.loadFromLocation());

  if (import.meta.env.PROD) {
    const plausible = Plausible({ domain: "app.radicle.xyz" });

    plausible.enableAutoPageviews();
  }

  $: document.documentElement.setAttribute("data-codefont", $codeFont);
  $: document.documentElement.setAttribute("data-theme", $theme);
</script>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    align-items: center;
  }
</style>

{#if $activeRouteStore.resource !== "booting"}
  <LoadingBar />
{/if}

<FullscreenModalPortal />
<Hotkeys />

{#if $activeRouteStore.resource === "booting"}
  <div class="loading">
    <Loading />
  </div>
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
{:else if $activeRouteStore.resource === "error"}
  <Error {...$activeRouteStore.params} />
{:else if $activeRouteStore.resource === "notFound"}
  <NotFound {...$activeRouteStore.params} />
{:else}
  {unreachable($activeRouteStore)}
{/if}
