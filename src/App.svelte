<script lang="ts">
  import Plausible from "plausible-tracker";

  import * as router from "@app/lib/router";
  import * as httpd from "@app/lib/httpd";
  import { unreachable } from "@app/lib/utils";

  import Header from "./App/Header.svelte";
  import Hotkeys from "./App/Hotkeys.svelte";
  import LoadingBar from "./App/LoadingBar.svelte";
  import ModalPortal from "./App/ModalPortal.svelte";

  import Home from "@app/views/home/Index.svelte";
  import Projects from "@app/views/projects/View.svelte";
  import Seeds from "@app/views/seeds/View.svelte";
  import Session from "@app/views/session/Index.svelte";

  import LoadError from "@app/components/LoadError.svelte";
  import Loading from "@app/components/Loading.svelte";
  import NotFound from "@app/components/NotFound.svelte";

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
    background: var(--header-gradient);
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

<svelte:head>
  <title>Radicle</title>
</svelte:head>

{#if $activeRouteStore.resource !== "booting"}
  <LoadingBar />
{/if}

<ModalPortal />
<Hotkeys />

<div class="app">
  <Header />
  <div class="wrapper">
    {#if $activeRouteStore.resource === "home"}
      <Home {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "seeds"}
      <Seeds {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "session"}
      <Session activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "projects"}
      <Projects
        activeRoute={$activeRouteStore}
        project={$activeRouteStore.params.project} />
    {:else if $activeRouteStore.resource === "booting"}
      <Loading />
    {:else if $activeRouteStore.resource === "loadError"}
      <LoadError {...$activeRouteStore.params} />
    {:else if $activeRouteStore.resource === "notFound"}
      <div class="layout-centered">
        <NotFound
          title="Page not found"
          subtitle={`${$activeRouteStore.params.url.replace("/", "")}`} />
      </div>
    {:else}
      {unreachable($activeRouteStore)}
    {/if}
  </div>
</div>
