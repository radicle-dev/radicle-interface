<script lang="ts">
  import { onMount } from 'svelte';
  import { State, state } from './state';
  import { getInfo, withdrawVested } from './vesting';
  import type { VestingInfo } from './vesting';
  import type { Session } from '@app/session';
  import type { Config } from '@app/config';
  import Modal from '@app/Modal.svelte';
  import Address from '@app/Address.svelte';
  import { formatAddress, isAddressEqual } from '@app/utils';

  let input: HTMLElement;

  onMount(() => {
    input.focus();
  });

  export let config: Config;
  export let session: Session | null;

  let contractAddress = "";
  let info: VestingInfo | null = null;

  async function loadContract(config: Config) {
    state.set(State.Loading);
    info = await getInfo(contractAddress, config);
    state.set(State.Idle);
  }

  function reset() {
    info = null;
    state.set(State.Idle);
  }

  $: isBeneficiary = info && session && isAddressEqual(info.beneficiary, session.address);
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

<svelte:head>
  <title>Radicle &ndash; Vesting</title>
</svelte:head>

<main class="off-centered">
  <div>
    {#if info}
      <Modal>
        <span slot="title">
          {contractAddress}
        </span>
        <span slot="body">
          {#if $state === State.Withdrawn}
            Tokens successfully withdrawn to {formatAddress(info.beneficiary)}.
          {:else}
            <table>
              <tr><td class="label">Beneficiary</td><td><Address {config} address={info.beneficiary} compact resolve /></td></tr>
              <tr><td class="label">Allocation</td><td>{info.totalVesting} <strong>{info.symbol}</strong></td></tr>
              <tr><td class="label">Withdrawn</td><td>{info.withdrawn} <strong>{info.symbol}</strong></td></tr>
              <tr><td class="label">Withdrawable</td><td>{info.withdrawableBalance} <strong>{info.symbol}</strong></td></tr>
            </table>
          {/if}
        </span>
        <span slot="actions">
          {#if isBeneficiary}
            {#if $state === State.WithdrawingSign}
              <button disabled data-waiting class="primary regular">
                Waiting for signature...
              </button>
            {:else if $state === State.Withdrawing}
              <button disabled data-waiting class="primary regular">
                Withdrawing...
              </button>
            {:else if $state === State.Idle}
              <button on:click={() => withdrawVested(contractAddress, config)} class="primary regular">
                Withdraw
              </button>
            {/if}
          {/if}
          <button on:click={reset} class="regular">
            Back
          </button>
        </span>
      </Modal>
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
  </div>
</main>
