<script lang="ts">
  import type { Session } from "@app/session";
  import type { Config } from "@app/config";
  import type { VestingInfo } from "./vesting";

  import * as utils from "@app/utils";
  import Address from "@app/Address.svelte";
  import Button from "@app/Button.svelte";
  import Modal from "@app/Modal.svelte";
  import TextInput from "@app/TextInput.svelte";
  import { state, getInfo, withdrawVested } from "./vesting";

  export let config: Config;
  export let session: Session | null;

  let contractAddress = "";
  let info: VestingInfo | null = null;
  let validationMessage: string | undefined = undefined;
  let valid: boolean = false;

  async function loadContract(config: Config) {
    if (!valid) {
      return;
    }

    state.set("loading");
    try {
      info = await getInfo(contractAddress, config);
    } catch (error) {
      validationMessage =
        "Couldn't load contract, check dev console for details.";
      console.error(error);
    }
    state.set("idle");
  }

  $: isBeneficiary =
    info && session && utils.isAddressEqual(info.beneficiary, session.address);

  function validate(address: string) {
    if (address === "") {
      return { valid: false };
    }

    if (!utils.isAddress(address)) {
      return {
        valid: false,
        validationMessage: "Please enter a valid Ethereum address.",
      };
    }

    return { valid: true };
  }

  $: ({ valid, validationMessage } = validate(contractAddress));
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
    justify-content: center;
    padding-bottom: 24vh;
    padding-top: 5rem;
    width: 38rem;
  }
  .title {
    color: var(--color-secondary);
    font-size: var(--font-size-medium);
  }
  .form {
    display: flex;
    gap: 1rem;
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

{#if info}
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
              <Address {config} address={info.beneficiary} compact resolve />
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
            on:click={() => withdrawVested(contractAddress, config)}
            variant="primary">
            Withdraw
          </Button>
        {/if}
      {/if}
      <Button
        on:click={() => {
          info = null;
          state.set("idle");
        }}
        variant="primary">
        Back
      </Button>
    </span>
  </Modal>
{:else}
  <main>
    <div class="title">
      Your Radicle <span class="txt-bold">vesting contract</span>
    </div>

    <div class="form">
      <TextInput
        autofocus
        placeholder="Enter vesting contract address"
        {valid}
        {validationMessage}
        loading={$state === "loading"}
        disabled={$state === "loading"}
        on:submit={() => {
          loadContract(config);
        }}
        bind:value={contractAddress} />

      <Button
        on:click={() => loadContract(config)}
        variant="primary"
        waiting={$state === "loading"}
        disabled={!valid || $state === "loading"}>
        Load
      </Button>
    </div>
  </main>
{/if}
