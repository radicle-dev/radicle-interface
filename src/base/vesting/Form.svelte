<script lang="ts">
  import type { Wallet } from "@app/wallet";

  import * as utils from "@app/utils";
  import * as router from "@app/router";
  import Button from "@app/Button.svelte";
  import TextInput from "@app/TextInput.svelte";
  import { state, getInfo } from "./vesting";

  export let wallet: Wallet;

  let contractAddress = "";

  $: valid = utils.isAddress(contractAddress);
  $: validationMessage =
    contractAddress !== "" && !valid
      ? "Please enter a valid Ethereum address."
      : "";

  const loadContract = async () => {
    state.set("loading");
    try {
      const info = await getInfo(contractAddress, wallet);
      router.push({
        resource: "vesting",
        params: {
          view: {
            resource: "view",
            params: { contract: contractAddress, info },
          },
        },
      });
    } catch (error) {
      validationMessage =
        "Couldn't load contract, check dev console for details.";
      console.error(error);
    }
    state.set("idle");
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
      loading={$state === "loading"}
      disabled={$state === "loading"}
      on:submit={loadContract}
      bind:value={contractAddress} />

    <Button
      on:click={loadContract}
      variant="primary"
      waiting={$state === "loading"}
      disabled={!valid || $state === "loading"}>
      Load
    </Button>
  </div>
</main>
