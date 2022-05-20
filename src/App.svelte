<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import { getConfig } from '@app/config';
  import { Connection, state, session } from '@app/session';

  import Home from '@app/base/home/Index.svelte';
  import Vesting from '@app/base/vesting/Index.svelte';
  import Registrations from '@app/base/registrations/Routes.svelte';
  import Orgs from '@app/base/orgs/Routes.svelte';
  import Users from '@app/base/users/Routes.svelte';
  import Seeds from '@app/base/seeds/Routes.svelte';
  import Faucet from '@app/base/faucet/Routes.svelte';
  import Projects from '@app/base/projects/Routes.svelte';
  import Profile from '@app/Profile.svelte';
  import Resolver from '@app/base/resolver/Routes.svelte';
  import Header from '@app/Header.svelte';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import LinearGradient from "@app/LinearGradient.svelte";

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
    if (event.key === 'Enter') {
      let elems = document.querySelectorAll<HTMLElement>('button.primary');
      if (elems.length == 1) { // We only allow this when there's one primary button.
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
    background: linear-gradient(
      180deg,
      var(--color-secondary-background) 0%,
      transparent 30%,
      transparent 100%
    );
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
  {#if import.meta.env.PROD}
    <script defer data-domain="app.radicle.network" src="https://plausible.io/js/plausible.js"></script>
  {/if}
</svelte:head>

<div class="app">
  {#await loadConfig}
    <!-- Loading wallet -->
    <div class="wrapper">
      <Loading center />
    </div>
  {:then config}
    <Header session={$session} {config} />
    <div class="wrapper">
      <Router>
        <Route path="/">
          <Home {config} />
        </Route>
        <Route path="vesting">
          <Vesting {config} session={$session} />
        </Route>
        <Registrations {config} session={$session} />
        <Orgs {config} />
        <Seeds {config} session={$session} />
        <Faucet {config} />
        <Users />
        <Resolver {config} />
        <Route path="/:addressOrName" let:params>
          <Profile addressOrName={params.addressOrName} {config} />
        </Route>
        <Projects {config} />
      </Router>
    </div>
  {:catch err}
    <div class="wrapper">
      <Modal error subtle>
        <span slot="title">
          <h3>👻</h3>
          <div>Error connecting to network</div>
        </span>

        <span slot="body">
          {err}
        </span>
      </Modal>
    </div>
  {/await}
  <!-- Adds a svg linear gradient that can be used by any other svg under the id #gradient -->
  <LinearGradient id="gradient" />
</div>
