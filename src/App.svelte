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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      (document.querySelector('button.primary') as HTMLElement).click();
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
{#await getConfig()}
  <!-- Loading wallet -->
{:then config}
  <div class="app">
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
  </div>
{:catch}
  <!-- Show error -->
{/await}
