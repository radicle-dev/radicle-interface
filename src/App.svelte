<script lang="javascript">
  import { ethers } from 'ethers';
  import { get } from 'svelte/store';
  import { STATE, state, error } from './state.js';
  import { getConfig } from './config.js';
  import { session } from './session.js';
  import { getInfo } from './vesting.js';
  import Header from './Header.svelte';

  let contractAddress = "";
  let info = null;

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      document.querySelector('button.primary').click();
    }
  }

  async function loadContract(config) {
    state.set(STATE.LOADING);
    info = await getInfo(contractAddress, config);
    state.set(STATE.IDLE);
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
  .modal {
    padding: 2rem;
    border: 1px solid var(--color-secondary);
    box-shadow: 8px 8px 64px var(--color-secondary-2);
    min-width: 480px;
    text-align: center;
  }
  .modal-title {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: var(--color-secondary);
    text-align: center;
  }
  .modal-body {
    margin: 3rem 0;
  }
  .modal-actions {
    margin-top: 2rem;
    text-align: center;
  }
  div.input-caption {
    font-size: 1.25rem;
    text-align: left;
    margin-left: 1.5rem;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    color: var(--color-secondary);
  }
  div.input-main {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin-left: 1.5rem;
    color: var(--color-secondary);
  }

  table {
    table-layout: fixed;
    border-collapse: collapse;
    width: 100%;
    max-width: 480px;
  }
  td {
    text-align: left;
  }
  td.label {
    color: var(--color-secondary);
  }
  td strong {
    font-weight: 600;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<div class="app">
  <Header/>
  {#await getConfig()}
    <!-- Loading wallet -->
  {:then config}
    <div class="wrapper">
      <main>
        {#if info}
          <div class="modal">
            <div class="modal-title">
              {contractAddress}
            </div>
            <div class="modal-body">
              <table>
                <tr><td class="label">Beneficiary</td><td>{info.beneficiary}</td></tr>
                <tr><td class="label">Allocation</td><td>{info.totalVesting} <strong>{info.symbol}</strong></td></tr>
                <tr><td class="label">Withdrawn</td><td>{info.withdrawn} <strong>{info.symbol}</strong></td></tr>
                <tr><td class="label">Withdrawable</td><td>{info.withdrawableBalance} <strong>{info.symbol}</strong></td></tr>
              </table>
            </div>
            <div class="modal-actions">
              <button on:click={() => info = null} class="small">
                Back
              </button>
            </div>
          </div>
        {:else}
          <div class="input-caption">
            Enter your Radicle <strong>vesting contract</strong> address
          </div>
          <div class="input-main">
            <span class="name">
              <div>
                <input
                  autofocus
                  size="40"
                  placeholder=""
                  class="subdomain"
                  disabled={$state === STATE.LOADING}
                  type="text" bind:value={contractAddress}
                />
              </div>
            </span>
            <button
              on:click={() => loadContract(config)}
              class="primary"
              data-waiting={$state === STATE.LOADING || null}
              disabled={$state === STATE.LOADING}
            >
              Load
            </button>
          </div>
        {/if}
      </main>
    </div>
  {:catch error}
    Ethereum wallet not available.
  {/await}
</div>
