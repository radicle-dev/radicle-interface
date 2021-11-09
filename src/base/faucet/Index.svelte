<script lang="ts">
  import type { Config } from "@app/config";
  import { BigNumber } from "@ethersproject/bignumber";
  import { formatEther, parseUnits } from "@ethersproject/units";
  import type { ethers } from "ethers";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { getMaxWithdrawAmount, lastWithdrawalByUser, calculateTimeLock } from "./lib";

  export let config: Config;

  let amount = 0;
  let maxWithdrawAmount: BigNumber;
  let lastWithdrawal: BigNumber;
  let error: string | undefined;

  async function withdraw() {
    const [state, message] = await isAbleToWithdraw(amountBN);
    if (state === true) navigate("/faucet/withdraw", { state: { amount } });
    else error = message;
  }

  async function isAbleToWithdraw(amount: ethers.BigNumber): Promise<[boolean, string?]> {
    if (amount.isZero()) { return [false, "Not able to withdraw zero tokens"]; }
    if (parseUnits(amountBN.toString()).gt(maxWithdrawAmount)) return [false, `Reduce amount, max withdrawal is ${formatEther(maxWithdrawAmount)}`];
    let currentTime = new Date().getTime();
    let timelock = await calculateTimeLock(amountBN, config);
    let nextAvailableWithdraw = lastWithdrawal.add(timelock).mul(Math.pow(10,3));
    if (nextAvailableWithdraw.gt(currentTime)) return [false, `Not ready to withdraw, return after ${new Date(nextAvailableWithdraw.toNumber()).toUTCString()}`];

    return [true];
  }
  
  onMount(async () => {
    maxWithdrawAmount = await getMaxWithdrawAmount(config);
    lastWithdrawal = await lastWithdrawalByUser(config);
  });

  $: amountBN = amount ? BigNumber.from(amount) : BigNumber.from(0);
</script>

<style>
  div.input-caption {
    font-size: 1.25rem;
    text-align: left;
    margin-left: 1.5rem;
    padding-left: 1.5rem;
    color: var(--color-secondary);
  }
  div.input-main {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    margin: 1rem 1.5rem 0rem;
    color: var(--color-secondary);
  }
  input[type="number"] {
    margin: 0;
    margin-right: 1.5rem;
  }
  .name {
    display: flex;
    flex-direction: row;
    margin: 1rem;
    margin-bottom: 0;
  }
  .error {
    padding-left: 1rem;
    padding-top: 1rem;
  }
  .description :global(p) {
    padding: 0;
    margin: 0;
  }
  .description.invalid {
    color: var(--color-negative) !important;
  }

</style>

<svelte:head>
  <title>Radicle: Faucet</title>
</svelte:head>

<main class="off-centered">
  <div>
    {#if config.network.name == "homestead"}
      <div class="input-caption">
        To get RAD tokens on <strong>{config.network.name}</strong>, please
        check the known exchanges.
      </div>
    {:else if !config.signer}
      <div class="input-caption">
        To get RAD tokens on <strong>{config.network.name}</strong>, please
        connect your wallet.
      </div>
    {:else}
      <div class="input-caption">
        Obtain RAD tokens on <strong>{config.network.name}</strong>
      </div>
      <div class="input-main">
        <div class="name">
          <input
            type="number"
            placeholder="Set amount to withdraw"
            bind:value={amount}
            on:input={() => error = ""}
          />
        <button disabled={false} class="primary" on:click={withdraw}>
            Withdraw
        </button>
        </div>
        {#if error}
        <div class="error description invalid text-small faded">
          {error}
        </div>
        {/if}
      </div>
    {/if}
  </div>
</main>
