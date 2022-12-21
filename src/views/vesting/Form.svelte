<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";

  import * as utils from "@app/lib/utils";
  import * as router from "@app/lib/router";
  import Button from "@app/components/Button.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import { state, getInfo } from "@app/lib/vesting";

  export let wallet: Wallet;

  let contractAddress = "";

  $: valid = utils.isAddress(contractAddress);
  $: validationMessage =
    contractAddress !== "" && !valid
      ? "Please enter a valid Ethereum address."
      : "";

  const loadContract = async () => {
    state.set({ type: "loading" });
    try {
      const info = await getInfo(contractAddress, wallet);
      if (info) {
        router.push({
          resource: "profile",
          params: { addressOrName: contractAddress },
        });
      } else {
        validationMessage = "No vesting account found under this address.";
      }
    } catch (error) {
      validationMessage =
        "Couldn't load contract, check dev console for details.";
      console.warn(error);
    }
    state.set({ type: "idle" });
  };
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
</style>

<svelte:head>
  <title>Radicle &ndash; Vesting</title>
</svelte:head>

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
      loading={$state.type === "loading"}
      disabled={$state.type === "loading"}
      on:submit={loadContract}
      bind:value={contractAddress} />

    <Button
      on:click={loadContract}
      variant="primary"
      waiting={$state.type === "loading"}
      disabled={!valid || $state.type === "loading"}>
      Load
    </Button>
  </div>
</main>
