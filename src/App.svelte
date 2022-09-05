<script lang="ts">
  import { Route, router } from "tinro";
  import { getConfig } from "@app/config";
  import { Connection, state, session } from "@app/session";
  import { getSearchParam } from "@app/utils";

  import Home from "@app/base/home/Index.svelte";
  import Vesting from "@app/base/vesting/Index.svelte";
  import Registrations from "@app/base/registrations/Routes.svelte";
  import Seeds from "@app/base/seeds/Routes.svelte";
  import Faucet from "@app/base/faucet/Routes.svelte";
  import NotFound from "@app/NotFound.svelte";
  import Profile from "@app/Profile.svelte";
  import Resolve from "@app/base/resolver/Query.svelte";
  import Header from "@app/Header.svelte";
  import ProjectView from "@app/base/projects/View.svelte";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import LinearGradient from "@app/LinearGradient.svelte";

  router.mode.history();

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
    background: linear-gradient(180deg, #181a38 0%, transparent 100%);
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
    <Header session={$session} {config} />
    <div class="wrapper">
      <Route firstmatch>
        <Route path="/">
          <Home {config} />
        </Route>

        <Route path="/registrations/*" firstmatch>
          <Registrations {config} session={$session} />
        </Route>

        <Route path="/seeds/*" firstmatch>
          <Seeds {config} session={$session} />
        </Route>

        <Route path="/faucet/*" firstmatch>
          <Faucet {config} />
        </Route>

        <Route path="/resolver/query" let:meta>
          <Resolve {config} query={getSearchParam("q", meta.query)} />
        </Route>

        <Route path="/vesting">
          <Vesting {config} session={$session} />
        </Route>

        <Route path="/users/:addressOrName" let:meta firstmatch>
          <Route path="/" redirect="/{meta.params.addressOrName}" />
          <Route path="/users/:addressOrName/projects/:id/*" let:meta>
            <Route
              path="/"
              redirect="/{meta.params.addressOrName}/{meta.params.id}/{meta
                .params['*']}" />
          </Route>
        </Route>

        <Route path="/orgs/*" firstmatch>
          <Route path="/">
            <NotFound
              title="404"
              subtitle="Radicle Orgs are in the process of being re-designed." />
          </Route>
          <Route path="/:addressOrName" let:meta>
            <Route path="/" redirect="/{meta.params.addressOrName}" />
          </Route>
          <Route path="/:addressOrName/projects/:id/*" let:meta>
            <Route
              path="/"
              redirect="/{meta.params.addressOrName}/{meta.params.id}/{meta
                .params['*']}" />
          </Route>
        </Route>

        <Route path="/:addressOrName/*" firstmatch>
          <Route path="/" let:meta>
            <Profile addressOrName={meta.params.addressOrName} {config} />
          </Route>
          <Route path="/:id/*" firstmatch>
            <Route path="/" let:meta>
              <ProjectView
                {config}
                profileName={meta.params.addressOrName}
                id={meta.params.id} />
            </Route>
            <Route path="/remotes/:peer/*" let:meta>
              <ProjectView
                {config}
                profileName={meta.params.addressOrName}
                id={meta.params.id}
                peer={meta.params.peer} />
            </Route>
          </Route>
        </Route>
      </Route>
    </div>
  {:catch err}
    <div class="wrapper">
      <Modal error subtle>
        <span slot="title">
          <h3>👻</h3>
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
