<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import { getWallet } from "@app/wallet";
  import { Connection, state, session } from "@app/session";

  import Home from "@app/base/home/Index.svelte";
  import Vesting from "@app/base/vesting/Index.svelte";
  import Registrations from "@app/base/registrations/Routes.svelte";
  import Seeds from "@app/base/seeds/Routes.svelte";
  import Faucet from "@app/base/faucet/Routes.svelte";
  import Projects from "@app/base/projects/Routes.svelte";
  import Profile from "@app/Profile.svelte";
  import Header from "@app/Header.svelte";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import ColorPalette from "./ColorPalette.svelte";

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
    <ColorPalette />
    <Header session={$session} {wallet} />
    <div class="wrapper">
      <Router>
        <Route path="/">
          <Home />
        </Route>
        <Route path="vesting">
          <Vesting {wallet} session={$session} />
        </Route>
        <Registrations {wallet} session={$session} />
        <Seeds {wallet} session={$session} />
        <Faucet {wallet} />
        <Route path="/:addressOrName" let:params>
          <Profile addressOrName={params.addressOrName} {wallet} />
        </Route>
        <Projects {wallet} />
      </Router>
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
</div>
