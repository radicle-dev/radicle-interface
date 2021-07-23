<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import { getConfig } from '@app/config';
  import { Connection, state, session } from '@app/session';
  import ModalOverlay from '@app/components/ModalOverlay.svelte';
  import Home from '@app/base/home/Index.svelte';
  import Vesting from '@app/base/vesting/Index.svelte';
  import Registrations from '@app/base/registrations/Routes.svelte';
  import Orgs from '@app/base/orgs/Routes.svelte';
  import Users from '@app/base/users/Routes.svelte';
  import IDX from "@app/base/idx/Routes.svelte";
  import Projects from '@app/base/projects/Routes.svelte';
  import Resolver from '@app/base/resolver/Routes.svelte';
  import Header from '@app/Header.svelte';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';

  const loadConfig = getConfig().then(cfg => {
    if ($state.connection === Connection.Connected) {
      state.refreshBalance(cfg);
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
  }
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 100%;
  }
</style>

<ModalOverlay />

<svelte:window on:keydown={handleKeydown} />
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
          <Home />
        </Route>
        <Route path="vesting">
          <Vesting {config} session={$session} />
        </Route>
        <Registrations {config} session={$session} />
        <Orgs {config} />
        <Users {config} />
        <IDX {config} />
        <Projects {config} />
        <Resolver {config} />
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
</div>
