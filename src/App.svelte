<script lang="ts">
  import { Connection, state, session } from "@app/session";
  import { getWallet } from "@app/wallet";
  import { initialize, activeRouteStore } from "@app/router";
  import { twemoji, unreachable } from "@app/utils";

  import Header from "@app/Header.svelte";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import Preload from "@app/router/Preload.svelte";

  initialize();

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
  {#await loadWallet}
    <!-- Loading wallet -->
    <div class="wrapper">
      <Loading center />
    </div>
  {:then wallet}
    <Header session={$session} {wallet} />
    <div class="wrapper">
      {#if $activeRouteStore.resource === "home"}
        <Preload path="/src/base/home/Index.svelte" />
      {:else if $activeRouteStore.resource === "faucet"}
        <Preload
          path="/src/base/faucet/Routes.svelte"
          {wallet}
          activeRoute={$activeRouteStore} />
      {:else if $activeRouteStore.resource === "seeds"}
        <Preload
          path="/src/base/seeds/Routes.svelte"
          {wallet}
          host={$activeRouteStore.params.host}
          session={$session} />
      {:else if $activeRouteStore.resource === "registrations"}
        <Preload
          path="/src/base/registrations/Routes.svelte"
          {wallet}
          activeRoute={$activeRouteStore}
          session={$session} />
      {:else if $activeRouteStore.resource === "vesting"}
        <Preload
          path="/src/base/vesting/Index.svelte"
          {wallet}
          session={$session} />
      {:else if $activeRouteStore.resource === "projects"}
        <Preload
          path="/src/base/projects/View.svelte"
          {wallet}
          activeRoute={$activeRouteStore} />
      {:else if $activeRouteStore.resource === "profile"}
        <Preload
          path="src/Profile.svelte"
          {wallet}
          addressOrName={$activeRouteStore.params.addressOrName} />
      {:else if $activeRouteStore.resource === "404"}
        <Preload
          path="src/NotFound.svelte"
          title="404"
          subtitle="Nothing here" />
      {:else}
        {unreachable($activeRouteStore)}
      {/if}
    </div>
  {:catch err}
    <div class="wrapper">
      <Modal error subtle>
        <span slot="title">
          <div class="emoji" use:twemoji>👻</div>
          <div>Error connecting to network</div>
        </span>

        <span slot="body">
          {err.message ? err.message : JSON.stringify(err)}
        </span>
      </Modal>
    </div>
  {/await}
</div>
