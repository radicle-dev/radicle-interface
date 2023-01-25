<script lang="ts">
  import Plausible from "plausible-tracker";

  import * as ethereum from "@app/lib/session";
  import * as router from "@app/lib/router";
  import { activeRouteStore } from "@app/lib/router";
  import { unreachable } from "@app/lib/utils";

  import ColorPalette from "@app/App/ColorPalette.svelte";
  import Header from "@app/App/Header.svelte";

  import NotFound from "@app/components/NotFound.svelte";

  import Faucet from "@app/views/faucet/Routes.svelte";
  import Home from "@app/views/home/Index.svelte";
  import Profile from "@app/views/profiles/Profile.svelte";
  import Projects from "@app/views/projects/View.svelte";
  import Registrations from "@app/views/registrations/Routes.svelte";
  import Seeds from "@app/views/seeds/Routes.svelte";
  import Vesting from "@app/views/vesting/Routes.svelte";

  router.initialize();
  ethereum.initialize();

  if (!window.VITEST && !window.PLAYWRIGHT && import.meta.env.PROD) {
    const plausible = Plausible({
      domain: "app.radicle.xyz",
      hashMode: window.HASH_ROUTING,
    });

    plausible.enableAutoPageviews();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      const elems = document.querySelectorAll<HTMLElement>("button.primary");
      if (elems.length === 1) {
        // We only allow this when there's one primary button.
        elems[0].click();
      }
    }
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

<svelte:window on:keydown={handleKeydown} />
<svelte:head>
  <title>Radicle</title>
</svelte:head>

<div class="app">
  <ColorPalette />
  <Header />
  <div class="wrapper">
    {#if $activeRouteStore.resource === "home"}
      <Home />
    {:else if $activeRouteStore.resource === "faucet"}
      <Faucet activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "seeds"}
      <Seeds host={$activeRouteStore.params.host} />
    {:else if $activeRouteStore.resource === "registrations"}
      <Registrations activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "vesting"}
      <Vesting activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "projects"}
      <Projects activeRoute={$activeRouteStore} />
    {:else if $activeRouteStore.resource === "profile"}
      <Profile addressOrName={$activeRouteStore.params.addressOrName} />
    {:else if $activeRouteStore.resource === "404"}
      <NotFound title="404" subtitle="Nothing here" />
    {:else}
      {unreachable($activeRouteStore)}
    {/if}
  </div>
</div>
