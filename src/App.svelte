<script lang="ts">
  import Plausible from "plausible-tracker";

  import { initialize, activeRouteStore } from "@app/lib/router";
  import { unreachable } from "@app/lib/utils";

  import Header from "./App/Header.svelte";
  import ModalPortal from "./App/ModalPortal.svelte";
  import Hotkeys from "./App/Hotkeys.svelte";

  import NotFound from "@app/components/NotFound.svelte";
  import Home from "@app/views/home/Index.svelte";
  import Session from "@app/views/session/Index.svelte";
  import Projects from "@app/views/projects/View.svelte";
  import Seeds from "@app/views/seeds/Routes.svelte";

  initialize();

  if (!window.VITEST && !window.PLAYWRIGHT && import.meta.env.PROD) {
    const plausible = Plausible({
      domain: "app.radicle.xyz",
      hashMode: window.HASH_ROUTING,
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

<ModalPortal />
<Hotkeys />

<div class="app">
  <Header />
  <div class="wrapper">
    {#if $activeRouteStore.resource === "home"}
      <Home />
    {:else if $activeRouteStore.resource === "seeds"}
      <Seeds host={$activeRouteStore.params.host} />
    {:else if $activeRouteStore.resource === "session"}
      <Session activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "projects"}
      <Projects activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "404"}
      <div class="layout-centered">
        <NotFound title="404" subtitle="Nothing here" />
      </div>
    {:else}
      {unreachable($activeRouteStore)}
    {/if}
  </div>
</div>
