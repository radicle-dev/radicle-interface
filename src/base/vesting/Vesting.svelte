<script lang="javascript">
  import { ethers } from 'ethers';
  import { get } from 'svelte/store';
  import { STATE, state } from './state.js';
  import { getConfig } from '../../config.js';
  import { getInfo } from './vesting.js';

  let contractAddress = "";
  let info = null;

  async function loadContract(config) {
    state.set(STATE.LOADING);
    info = await getInfo(contractAddress, config);
    state.set(STATE.IDLE);
  }
</script>

<style>
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
</style>

{#await getConfig()}
  <!-- Loading wallet -->
{:then config}
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
{:catch error}
  Ethereum wallet not available.
{/await}
