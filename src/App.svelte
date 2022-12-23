<script lang="ts">
  import Plausible from "plausible-tracker";

  import { Connection, state, session } from "@app/lib/session";
  import { getWallet } from "@app/lib/wallet";
  import { initialize, activeRouteStore } from "@app/lib/router";
  import { unreachable } from "@app/lib/utils";

  import Header from "./App/Header.svelte";
  import ModalPortal from "./App/ModalPortal.svelte";
  import Hotkeys from "./App/Hotkeys.svelte";

  import Loading from "@app/components/Loading.svelte";
  import NotFound from "@app/components/NotFound.svelte";
  import Error from "@app/components/Error.svelte";

  import Faucet from "@app/views/faucet/Faucet.svelte";
  import Home from "@app/views/home/Index.svelte";
  import Profile from "@app/views/profiles/Profile.svelte";
  import Projects from "@app/views/projects/View.svelte";
  import Registrations from "@app/views/registrations/Routes.svelte";
  import Seeds from "@app/views/seeds/Routes.svelte";
  import Vesting from "@app/views/vesting/Routes.svelte";

  initialize();

  if (!window.VITEST && !window.PLAYWRIGHT && import.meta.env.PROD) {
    const plausible = Plausible({
      domain: "app.radicle.xyz",
      hashMode: window.HASH_ROUTING,
    });

    plausible.enableAutoPageviews();
  }

  const loadWallet = getWallet().then(async wallet => {
    if ($state.connection === Connection.Connected) {
      state.refreshBalance(wallet);
    } else if ($state.connection === Connection.Disconnected) {
      // Update the session state if we're already connected to WalletConnect
      // from a previous session.
      if (wallet.walletConnect.client.connected) {
        await state.connectWalletConnect(wallet);
      } else if (wallet.metamask.connected) {
        await state.connectMetamask(wallet);
      }
    }
    return wallet;
  });
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
  {#await loadWallet}
    <div class="wrapper">
      <Loading center />
    </div>
  {:then wallet}
    <Header session={$session} {wallet} />
    <div class="wrapper">
      {#if $activeRouteStore.resource === "home"}
        <Home />
      {:else if $activeRouteStore.resource === "faucet"}
        <Faucet {wallet} />
      {:else if $activeRouteStore.resource === "seeds"}
        <Seeds host={$activeRouteStore.params.host} />
      {:else if $activeRouteStore.resource === "registrations"}
        <Registrations {wallet} activeRoute={$activeRouteStore} />
      {:else if $activeRouteStore.resource === "vesting"}
        <Vesting {wallet} activeRoute={$activeRouteStore} />
      {:else if $activeRouteStore.resource === "projects"}
        <Projects {wallet} activeRoute={$activeRouteStore} />
      {:else if $activeRouteStore.resource === "profile"}
        <Profile
          addressOrName={$activeRouteStore.params.addressOrName}
          {wallet} />
      {:else if $activeRouteStore.resource === "404"}
        <div class="wrapper" style:justify-content="center">
          <NotFound title="404" subtitle="Nothing here" />
        </div>
      {:else}
        {unreachable($activeRouteStore)}
      {/if}
    </div>
  {:catch err}
    <div class="wrapper" style:justify-content="center">
      <Error
        title="Error connecting to network"
        message={err.message ? err.message : JSON.stringify(err)} />
    </div>
  {/await}
</div>
