<script lang="typescript">
  // TODO: Navigating directly to /vesting doesn't work.
  import { ethers } from 'ethers';
  import { get } from 'svelte/store';
  import { Router, Link, Route } from "svelte-routing";
  import { getConfig } from '@app/config';
  import { session } from '@app/session';

  import Vesting from '@app/base/vesting/Vesting.svelte';
  import Register from '@app/base/register/Routes.svelte';
  import Orgs from '@app/base/orgs/Routes.svelte';
  import Header from '@app/Header.svelte';

  const defaultPath = "register";
  const path = window.location.pathname;
  const query = new URLSearchParams(window.location.search);
  export let url = path === "/" ? defaultPath : path;

  function handleKeydown(event) {
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
    height: 24rem;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
{#await getConfig()}
  <!-- Loading wallet -->
{:then config}
  <div class="app">
    <Header session={$session} {config} />
    <div class="wrapper">
      <Router url="{url}">
        <Route path="vesting">
          <Vesting {config} session={$session} />
        </Route>
        <Register {config} {query} session={$session} />
        <Orgs {config} {query} />
      </Router>
    </div>
  </div>
{:catch err}
  <!-- Show error -->
{/await}
