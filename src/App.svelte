<script lang="typescript">
  // TODO: Navigating directly to /vesting doesn't work.
  import { Router, Route } from "svelte-routing";
  import { getConfig } from '@app/config';
  import { session } from '@app/session';

  import Home from '@app/base/home/Index.svelte';
  import Vesting from '@app/base/vesting/Index.svelte';
  import Registrations from '@app/base/registrations/Routes.svelte';
  import Orgs from '@app/base/orgs/Routes.svelte';
  import Resolver from '@app/base/resolver/Routes.svelte';
  import Header from '@app/Header.svelte';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      let elems = document.querySelectorAll('button.primary') as NodeListOf<HTMLElement>;
      if (elems.length == 1) { // We only allow this when there's one primary button.
        elems[0].click();
      }
    }
  }
</script>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    min-height: 24rem;
    padding-top: 6rem;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<div class="app">
  {#await getConfig()}
    <!-- Loading wallet -->
    <Loading center />
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
