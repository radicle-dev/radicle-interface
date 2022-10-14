<script lang="ts">
  import { getConfig } from "@app/config";
  import { Connection, state, session } from "@app/session";
  import { activeRouteStore, initialize } from "@app/router";

  import Home from "@app/base/home/Index.svelte";
  import Vesting from "@app/base/vesting/Index.svelte";
  import Seeds from "@app/base/seeds/Routes.svelte";
  import Faucet from "@app/base/faucet/Routes.svelte";
  import Project from "@app/base/projects/Project.svelte";
  import Profile from "@app/Profile.svelte";
  import Header from "@app/Header.svelte";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import LinearGradient from "@app/LinearGradient.svelte";
  import ColorPalette from "./ColorPalette.svelte";
  import Register from "@app/base/registrations/Index.svelte";
  import Registrations from "@app/base/registrations/Routes.svelte";
  import NotFound from "./NotFound.svelte";

  initialize();

  const loadConfig = getConfig().then(async cfg => {
    if ($state.connection === Connection.Connected) {
      state.refreshBalance(cfg);
    } else if ($state.connection === Connection.Disconnected) {
      // Update the session state if we're already connected to WalletConnect
      // from a previous session.
      if (cfg.walletConnect.client.connected) {
        await state.connectWalletConnect(cfg);
      } else if (cfg.metamask.connected) {
        await state.connectMetamask(cfg);
      }
    }
    return cfg;
  });

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
  .emoji {
    margin: 1rem 0;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<svelte:head>
  <title>Radicle</title>
  {#if import.meta.env.PROD}
    <script
      defer
      data-domain="app.radicle.xyz"
      src="https://plausible.io/js/plausible.js"></script>
  {/if}
</svelte:head>

<div class="app">
  {#await loadConfig}
    <!-- Loading wallet -->
    <div class="wrapper">
      <Loading center />
    </div>
  {:then config}
    <ColorPalette />
    <Header session={$session} {config} />
    <div class="wrapper">
      {#if $activeRouteStore.type === "home"}
        <Home {config} />
      {:else if $activeRouteStore.type === "faucet"}
        <Faucet {config} {...$activeRouteStore} />
      {:else if $activeRouteStore.type === "seeds"}
        <Seeds {config} session={$session} {...$activeRouteStore} />
      {:else if $activeRouteStore.type === "register"}
        <Register {config} />
      {:else if $activeRouteStore.type === "registrations"}
        <Registrations session={$session} {config} {...$activeRouteStore} />
      {:else if $activeRouteStore.type === "vesting"}
        <Vesting {config} session={$session} />
      {:else if $activeRouteStore.type === "projects"}
        <Project {config} {...$activeRouteStore} />
      {:else if $activeRouteStore.type === "profile"}
        <Profile
          {config}
          addressOrName={$activeRouteStore.params.profileName} />
      {:else}
        <NotFound title="404" subtitle="Nothing here" />
      {/if}
    </div>
  {:catch err}
    <div class="wrapper">
      <Modal error subtle>
        <span slot="title">
          <div class="emoji">👻</div>
          <div>Error connecting to network</div>
        </span>

        <span slot="body">
          {err.message ? err.message : JSON.stringify(err)}
        </span>
      </Modal>
    </div>
  {/await}
  <!-- Adds a svg linear gradient that can be used by any other svg under the id #gradient -->
  <LinearGradient id="gradient" />
</div>
