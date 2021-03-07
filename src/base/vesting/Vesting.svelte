<script lang="javascript">
  import { ethers } from 'ethers';
  import { get, derived } from 'svelte/store';
  import { session } from '@app/session.js';
  import { STATE, state } from './state.js';
  import { getInfo } from './vesting.js';

  export let config = null;

  let contractAddress = "";
  let info = null;

  async function loadContract(config) {
    state.set(STATE.LOADING);
    info = await getInfo(contractAddress, config);
    state.set(STATE.IDLE);
  }

  function withdrawVested() {}

  let isBeneficiary = derived(session, (s) => {
    return info && (info.beneficiary === s.address);
  });
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
        {#if $isBeneficiary}
          <button on:click={withdrawVested} class="primary small">
            Withdraw
          </button>
        {/if}
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
