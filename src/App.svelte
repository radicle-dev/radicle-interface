<script lang="javascript">
  import { ethers } from 'ethers';
  import { get } from 'svelte/store';
  import { getConfig } from './config.js';
  import { session } from './session.js';

  import Vesting from './base/vesting/Vesting.svelte';
  import Header from './Header.svelte';

  let contractAddress = "";
  let info = null;
  let app = Vesting;

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
<div class="app">
  <Header/>
  <div class="wrapper">
    <svelte:component this={app}/>
  </div>
</div>
