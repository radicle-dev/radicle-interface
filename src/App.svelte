<script lang="javascript">
  import { ethers } from 'ethers';
  import { get } from 'svelte/store';
  import { Router, Link, Route } from "svelte-routing";
  import { getConfig } from './config.js';
  import { session } from './session.js';

  import Vesting from './base/vesting/Vesting.svelte';
  import Register from './base/register/Register.svelte';
  import Header from './Header.svelte';

  export let url = "";

  let contractAddress = "";
  let info = null;

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      document.querySelector('button.primary').click();
    }
  }
</script>

<style>
  main {
    padding-top: 2rem;
    align-self: center;
  }
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
    <Header/>
    <div class="wrapper">
      <Router url="{url}">
        <Route path="vesting">
          <Vesting {config} />
        </Route>
        <Route path="register">
          <Register {config} />
        </Route>
      </Router>
    </div>
  </div>
{:catch err}
  <!-- Show error -->
{/await}
