<script lang="ts">
  import Plausible from "plausible-tracker";

  import * as router from "@app/lib/router";
  import * as session from "@app/lib/session";
  import { twemoji } from "@app/lib/utils";
  import { unreachable } from "@app/lib/utils";

  import Header from "./App/Header.svelte";
  import ModalPortal from "./App/ModalPortal.svelte";
  import Hotkeys from "./App/Hotkeys.svelte";

  import NotFound from "@app/components/NotFound.svelte";
  import Home from "@app/views/home/Index.svelte";
  import Session from "@app/views/session/Index.svelte";
  import Projects from "@app/views/projects/View.svelte";
  import Seeds from "@app/views/seeds/Routes.svelte";

  const activeRouteStore = router.activeRouteStore;

  router.initialize();
  session.initialize();

  if (!window.VITEST && !window.PLAYWRIGHT && import.meta.env.PROD) {
    const plausible = Plausible({
      domain: "app.radicle.xyz",
      hashMode: true,
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
  .deprecation {
    z-index: 100;
    top: 0;
    background: var(--color-foreground-3);
    padding: 4px 0;
    text-align: center;
    font-size: var(--font-size-small);
  }
  .deprecation ::selection {
    background: var(--color-foreground);
  }
  .deprecation :global(img::selection) {
    background: var(--color-foreground);
  }
</style>

<svelte:head>
  <title>Radicle</title>
</svelte:head>

<ModalPortal />
<Hotkeys />

<div class="deprecation" use:twemoji>
  <div>
    ℹ️ You're viewing the legacy app. Latest 👉
    <a href="https://app.radicle.xyz" class="txt-bold">app.radicle.xyz</a>
  </div>
</div>
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
