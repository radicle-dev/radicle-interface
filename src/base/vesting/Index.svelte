<script lang="ts">
  import type { Config } from "@app/config";
  import type { Session } from "@app/session";
  import type { VestingInfo } from "./vesting";

  import Address from "@app/Address.svelte";
  import Button from "@app/Button.svelte";
  import Modal from "@app/Modal.svelte";
  import TextInput from "@app/TextInput.svelte";
  import { State, state } from "./state";
  import { formatAddress, isAddressEqual } from "@app/utils";
  import { getInfo, withdrawVested } from "./vesting";

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

  $: isBeneficiary =
    info && session && isAddressEqual(info.beneficiary, session.address);
</script>

<style>
  .input-caption {
    font-size: var(--font-size-medium);
    text-align: left;
    margin-left: 1.5rem;
    margin-bottom: 2rem;
    color: var(--color-secondary);
  }
  .input-main {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin-left: 1.5rem;
    color: var(--color-secondary);
    gap: 1rem;
    justify-content: center;
  }
  table {
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 2rem 0;
  }
  td {
    text-align: left;
    text-overflow: ellipsis;
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
              <tr>
                <td class="label">Beneficiary</td>
                <td>
                  <Address
                    {config}
                    address={info.beneficiary}
                    compact
                    resolve />
                </td>
              </tr>
              <tr>
                <td class="label">Allocation</td>
                <td>
                  {info.totalVesting}
                  <span class="txt-bold">{info.symbol}</span>
                </td>
              </tr>
              <tr>
                <td class="label">Withdrawn</td>
                <td>
                  {info.withdrawn}
                  <span class="txt-bold">{info.symbol}</span>
                </td>
              </tr>
              <tr>
                <td class="label">Withdrawable</td>
                <td>
                  {info.withdrawableBalance}
                  <span class="txt-bold">{info.symbol}</span>
                </td>
              </tr>
            </table>
          {/if}
        </span>
        <span slot="actions">
          {#if isBeneficiary}
            {#if $state === State.WithdrawingSign}
              <Button disabled waiting={true} variant="primary">
                Waiting for signature…
              </Button>
            {:else if $state === State.Withdrawing}
              <Button disabled waiting={true} variant="primary">
                Withdrawing…
              </Button>
            {:else if $state === State.Idle}
              <Button
                on:click={() => withdrawVested(contractAddress, config)}
                variant="primary">
                Withdraw
              </Button>
            {/if}
          {/if}
          <Button on:click={reset} variant="primary">Back</Button>
        </span>
      </Modal>
    {:else}
      <div class="input-caption">
        Enter your Radicle <span class="txt-bold">vesting contract</span>
        address
      </div>
      <div class="input-main">
        <span class="name">
          <div style="width: 25rem;">
            <TextInput
              autofocus
              disabled={$state === State.Loading}
              bind:value={contractAddress} />
          </div>
        </span>
        <Button
          on:click={() => loadContract(config)}
          variant="primary"
          waiting={$state === State.Loading}
          disabled={$state === State.Loading}>
          Load
        </Button>
      </div>
    {/if}
  </div>
</main>
