<script lang="typescript">
  import { onMount } from 'svelte';
  import { get, derived, writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { ethers } from 'ethers';
  import { formatAddress } from '@app/utils';
  import { State, state } from './state';
  import { getInfo, withdrawVested } from './vesting';
  import type { Session } from '@app/session';

  let input;

  onMount(() => {
    input.focus();
  });

  export let config;
  export let session: Session;

  let contractAddress = "";
  let info = null;

  async function loadContract(config) {
    state.set(State.Loading);
    info = await getInfo(contractAddress, config);
    state.set(State.Idle);
  }

  function reset() {
    info = null;
    state.set(State.Idle);
  }

  $: isBeneficiary = info && session && (info.beneficiary === session.address);
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
        {#if $state === State.Withdrawn}
          Tokens successfully withdrawn to {formatAddress(info.beneficiary)}.
        {:else}
          <table>
            <tr><td class="label">Beneficiary</td><td>{info.beneficiary}</td></tr>
            <tr><td class="label">Allocation</td><td>{info.totalVesting} <strong>{info.symbol}</strong></td></tr>
            <tr><td class="label">Withdrawn</td><td>{info.withdrawn} <strong>{info.symbol}</strong></td></tr>
            <tr><td class="label">Withdrawable</td><td>{info.withdrawableBalance} <strong>{info.symbol}</strong></td></tr>
          </table>
        {/if}
      </div>
      <div class="modal-actions">
        {#if isBeneficiary}
          {#if $state === State.WithdrawingSign}
            <button disabled data-waiting class="primary small">
              Waiting for signature...
            </button>
          {:else if $state === State.Withdrawing}
            <button disabled data-waiting class="primary small">
              Withdrawing...
            </button>
          {:else if $state === State.Idle}
            <button on:click={() => withdrawVested(contractAddress, config)} class="primary small">
              Withdraw
            </button>
          {/if}
        {/if}
        <button on:click={reset} class="small">
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
            size="40"
            placeholder=""
            class="subdomain"
            disabled={$state === State.Loading}
            type="text"
            bind:this={input}
            bind:value={contractAddress}
          />
        </div>
      </span>
      <button
        on:click={() => loadContract(config)}
        class="primary"
        data-waiting={$state === State.Loading || null}
        disabled={$state === State.Loading}
      >
        Load
      </button>
    </div>
  {/if}
</main>
