<script lang="typescript">
  // TODO: Navigating directly to /vesting doesn't work.
  import { Router, Route } from "svelte-routing";
  import { getConfig } from '@app/config';
  import { session } from '@app/session';

  import Home from '@app/base/home/Home.svelte';
  import Vesting from '@app/base/vesting/Vesting.svelte';
  import Register from '@app/base/register/Routes.svelte';
  import Orgs from '@app/base/orgs/Routes.svelte';
  import Resolve from '@app/base/resolve/Routes.svelte';
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
        <Register {config} session={$session} />
        <Orgs {config} />
        <Resolve {config} />
      </Router>
    </div>
  </div>
{:catch}
  <!-- Show error -->
{/await}
