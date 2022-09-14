<script lang="ts">
  import type { Config } from "@app/config";
  import type { BigNumber } from "@ethersproject/bignumber";
  import { session } from "@app/session";
  import { setOpenGraphMetaTag, toWei } from "@app/utils";
  import { formatEther } from "@ethersproject/units";
  import { navigate } from "svelte-routing";
  import {
    getMaxWithdrawAmount,
    lastWithdrawalByUser,
    calculateTimeLock,
  } from "./lib";
  import Button from "@app/Button.svelte";
  import TextInput from "@app/TextInput.svelte";

  export let config: Config;

  let amount: string;
  let maxWithdrawAmount: BigNumber;
  let lastWithdrawal: BigNumber;
  let error: string | undefined;

  setOpenGraphMetaTag([
    { prop: "og:title", content: "Radicle Faucet" },
    { prop: "og:description", content: "Rinkeby Testnet Faucet" },
    { prop: "og:url", content: window.location.href },
  ]);

  async function withdraw() {
    const [state, message] = await isAbleToWithdraw(amount);
    if (state === true) navigate("/faucet/withdraw", { state: { amount } });
    else error = message;
  }

  async function isAbleToWithdraw(amount: string): Promise<[boolean, string?]> {
    try {
      if (!$session) {
        return [false];
      }
      if (!amount || amount === "0") {
        return [false, "Not able to withdraw zero tokens"];
      }
      if (toWei(amount).gt(maxWithdrawAmount)) {
        return [
          false,
          `Reduce amount, max withdrawal is ${formatEther(maxWithdrawAmount)}`,
        ];
      }
      const currentTime = new Date().getTime();
      const timelock = await calculateTimeLock(amount, $session.signer, config);
      // Converting a 10 digit to 13 digit timestamp by multiplying by 1000
      // since JS doesn't display a correct Date string when passing a 10 digit timestamp.
      const nextAvailableWithdraw = lastWithdrawal.add(timelock).mul(1000);
      if (nextAvailableWithdraw.gt(currentTime)) {
        return [
          false,
          `Not ready to withdraw, return after ${new Date(
            nextAvailableWithdraw.toNumber(),
          ).toLocaleString("en-GB")}`,
        ];
      }

      return [true];
    } catch (e: any) {
      console.error(e);
      error = e.message;

      return [false];
    }
  }

  $: if ($session) {
    getMaxWithdrawAmount($session.signer, config).then(
      x => (maxWithdrawAmount = x),
    );
    lastWithdrawalByUser($session.signer, config).then(
      x => (lastWithdrawal = x),
    );
  }
</script>

<style>
  .input-caption {
    font-size: var(--font-size-medium);
    text-align: left;
    color: var(--color-secondary);
    margin-bottom: 2rem;
    margin-left: 0.5rem;
  }
  .input-main {
    display: flex;
    align-items: flex-start;
    color: var(--color-secondary);
    flex-direction: column;
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
  .name {
    display: flex;
    gap: 1.5rem;
  }
</style>

<svelte:head>
  <title>Radicle: Faucet</title>
</svelte:head>

<main class="off-centered">
  <div>
    {#if config.network.name === "homestead"}
      <div class="input-caption">
        To get RAD tokens on <span class="txt-bold">
          {config.network.name}
        </span>
        , please check the known exchanges.
      </div>
    {:else if !$session}
      <div class="input-caption">
        To get RAD tokens on <span class="txt-bold">
          {config.network.name}
        </span>
        , please connect your wallet.
      </div>
    {:else}
      <div class="input-caption">
        Obtain RAD tokens on <span class="txt-bold">
          {config.network.name}
        </span>
      </div>
      <div class="input-main">
        <div class="name">
          <div style="width: 14.5rem;">
            <TextInput
              placeholder="Set amount to withdraw"
              bind:value={amount}
              on:input={() => (error = "")} />
          </div>
          <Button variant="primary" on:click={withdraw}>Withdraw</Button>
        </div>
        {#if error}
          <div class="error description invalid txt-small faded">
            {error}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>
