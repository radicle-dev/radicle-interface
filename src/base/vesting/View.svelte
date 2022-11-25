<script lang="ts">
  import type { Session } from "@app/session";
  import type { Wallet } from "@app/wallet";
  import type { VestingInfo } from "./vesting";

  import * as router from "@app/router";
  import * as utils from "@app/utils";
  import Address from "@app/Address.svelte";
  import Button from "@app/Button.svelte";
  import Modal from "@app/Modal.svelte";
  import { state, getInfo, withdrawVested } from "./vesting";
  import { onMount } from "svelte";
  import ErrorModal from "@app/ErrorModal.svelte";
  import Loading from "@app/Loading.svelte";

  export let contractAddress: string;
  export let info: VestingInfo | null = null;
  export let session: Session | null;
  export let wallet: Wallet;

  let error: Error | undefined = undefined;

  onMount(async () => {
    if (!info) {
      state.set("loading");
      try {
        info = await getInfo(contractAddress, wallet);
      } catch (e) {
        error = e as Error;
      }
    }
    state.set("idle");
  });

  const parseVestingPeriods = (input: string[]): string => {
    const total = input
      .map(s => parseInt(s))
      .reduce((prev, curr) => prev + curr, 0);
    return new Date(total * 1000).toDateString();
  };
</script>

<style>
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

{#if error}
  <ErrorModal
    title="Failed to obtain contract information"
    message={error.message}
    on:close={() => router.pop()} />
{:else if $state === "loading"}
  <Loading center />
{:else if info}
  {@const isBeneficiary =
    session && utils.isAddressEqual(info.beneficiary, session.address)}
  <Modal>
    <span slot="title">
      {contractAddress}
    </span>

    <span slot="body">
      {#if $state === "withdrawn"}
        Tokens successfully withdrawn to {utils.formatAddress(
          info.beneficiary,
        )}.
      {:else}
        <table>
          <tr>
            <td class="txt-highlight">Beneficiary</td>
            <td>
              <Address {wallet} address={info.beneficiary} compact resolve />
            </td>
          </tr>
          <tr>
            <td class="txt-highlight">Allocation</td>
            <td>
              {info.totalVesting}
              <span class="txt-bold">{info.symbol}</span>
            </td>
          </tr>
          <tr>
            <td class="txt-highlight">Withdrawn</td>
            <td>
              {info.withdrawn}
              <span class="txt-bold">{info.symbol}</span>
            </td>
          </tr>
          <tr>
            <td class="txt-highlight">Withdrawable</td>
            <td>
              {info.withdrawableBalance}
              <span class="txt-bold">{info.symbol}</span>
            </td>
          </tr>
          <tr>
            <td class="txt-highlight">Start Time</td>
            <td>
              <span class="txt-bold">
                {parseVestingPeriods([info.vestingStartTime])}
              </span>
            </td>
          </tr>
          <tr>
            <td class="txt-highlight">Cliff Period End</td>
            <td>
              <span class="txt-bold">
                {parseVestingPeriods([info.vestingStartTime, info.cliffPeriod])}
              </span>
            </td>
          </tr>
          <tr>
            <td class="txt-highlight">Vesting Period End</td>
            <td>
              <span class="txt-bold">
                {parseVestingPeriods([
                  info.vestingStartTime,
                  info.vestingPeriod,
                ])}
              </span>
            </td>
          </tr>
        </table>
      {/if}
    </span>

    <span slot="actions">
      {#if isBeneficiary}
        {#if $state === "withdrawingSign"}
          <Button disabled waiting={true} variant="primary">
            Waiting for signature…
          </Button>
        {:else if $state === "withdrawing"}
          <Button disabled waiting={true} variant="primary">
            Withdrawing…
          </Button>
        {:else if $state === "idle"}
          <Button
            on:click={() => withdrawVested(contractAddress, wallet)}
            variant="primary">
            Withdraw
          </Button>
        {/if}
      {/if}
      <Button on:click={() => router.pop()} variant="primary">Back</Button>
    </span>
  </Modal>
{/if}
