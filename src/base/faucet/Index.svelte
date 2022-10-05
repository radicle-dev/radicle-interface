<script lang="ts">
  import type { Config } from "@app/config";

  import { session } from "@app/session";
  import { setOpenGraphMetaTag, toWei } from "@app/utils";
  import { formatEther } from "@ethersproject/units";
  import { navigate } from "svelte-routing";
  import {
    calculateTimeLock,
    getMaxWithdrawAmount,
    lastWithdrawalByUser,
  } from "./lib";
  import Button from "@app/Button.svelte";
  import TextInput from "@app/TextInput.svelte";

  export let config: Config;

  let amount: string = "";
  let loading: boolean = false;
  let validationMessage: string | undefined = undefined;
  let valid: boolean = false;

  setOpenGraphMetaTag([
    { prop: "og:title", content: "Radicle Faucet" },
    { prop: "og:description", content: "Rinkeby Testnet Faucet" },
    { prop: "og:url", content: window.location.href },
  ]);

  async function withdraw(amount: string) {
    if (!valid || !$session) {
      return;
    }

    loading = true;
    try {
      const currentTime = new Date().getTime();
      const timelock = await calculateTimeLock(amount, $session.signer, config);
      const lastWithdrawal = await lastWithdrawalByUser(
        $session.signer,
        config,
      );
      const maxWithdrawAmount = await getMaxWithdrawAmount(
        $session.signer,
        config,
      );

      if (toWei(amount).gt(maxWithdrawAmount)) {
        validationMessage = `Reduce amount, max withdrawal is ${formatEther(
          maxWithdrawAmount,
        )}.`;
        return;
      }

      // Converting a 10 digit to 13 digit timestamp by multiplying by 1000
      // since JS doesn't display a correct Date string when passing a 10 digit
      // timestamp.
      const nextAvailableWithdraw = lastWithdrawal.add(timelock).mul(1000);
      if (nextAvailableWithdraw.gt(currentTime)) {
        validationMessage = `Not ready to withdraw, return after ${new Date(
          nextAvailableWithdraw.toNumber(),
        ).toLocaleString("en-GB")}`;
        return;
      }

      navigate("/faucet/withdraw", { state: { amount } });
    } catch (error) {
      validationMessage = "There was an error, check the dev console.";
      console.error(error);
    } finally {
      loading = false;
    }
  }

  function validate(amount: string) {
    if (amount === "") {
      return { valid: false };
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return {
        valid: false,
        validationMessage: "Please enter a positive number.",
      };
    }

    return { valid: true };
  }

  $: ({ valid, validationMessage } = validate(amount));
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
    width: 28rem;
  }
  .title {
    color: var(--color-secondary);
    font-size: var(--font-size-medium);
  }
  .subtitle {
    color: var(--color-secondary);
  }
  .form {
    display: flex;
    gap: 1rem;
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Faucet</title>
</svelte:head>

<main>
  <div class="title">
    Obtain RAD tokens on <span class="txt-bold">
      {config.network.name}
    </span>
  </div>

  {#if config.network.name === "homestead"}
    <div class="subtitle">
      To get RAD tokens on <span class="txt-bold">
        {config.network.name},
      </span>
      please
      <br />
      check
      <a class="link" href="https://docs.radicle.xyz/get-involved/obtain-rad">
        popular exchanges
      </a>
      &#8203;.
    </div>
  {:else if !$session}
    <div class="subtitle">
      To get RAD tokens on <span class="txt-bold">
        {config.network.name}
      </span>
      &#8203;,
      <br />
      please connect your wallet.
    </div>
  {:else}
    <div class="form">
      <TextInput
        autofocus
        placeholder="Enter amount to withdraw"
        {validationMessage}
        on:submit={() => {
          withdraw(amount);
        }}
        bind:value={amount}
        {valid}
        {loading} />

      <Button
        variant="primary"
        on:click={() => withdraw(amount)}
        disabled={!valid || loading}>
        Withdraw
      </Button>
    </div>
  {/if}
</main>
