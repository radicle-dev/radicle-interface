<script lang="ts">
  import type { State } from "@app/lib/utils";

  import * as router from "@app/lib/router";
  import Button from "@app/components/Button.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import networks from "@app/lib/ethereum/networks";
  import { Status } from "@app/lib/utils";
  import { networkStore, sessionStore } from "@app/lib/session";
  import { onMount } from "svelte";
  import { twemoji } from "@app/lib/utils";
  import { withdraw } from "@app/lib/faucet";

  export let amount: string | null;

  let contracts = networks[$networkStore.chainId];
  let error: Error;
  let state: State = {
    status: Status.Failed,
    error: "Error withdrawing, something happened.",
  };

  const signer = $sessionStore?.signer;

  function back() {
    router.push({ resource: "faucet", params: { view: { resource: "form" } } });
  }

  onMount(async () => {
    try {
      if (!amount) {
        throw new Error("You must supply the withdrawable amount.");
      }
      if (!contracts.radToken.faucet) {
        throw new Error("Faucet contract not found.");
      }
      if (signer) {
        state.status = Status.Signing;
        const tx = await withdraw(amount, contracts.radToken.faucet, signer);
        state.status = Status.Pending;
        await tx.wait();
        state.status = Status.Success;
      } else {
        back();
      }
    } catch (e: any) {
      console.error(e);
      error = e;
      state = { status: Status.Failed, error: e.message };
    }
  });
</script>

<style>
  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

{#if error}
  <ErrorModal
    title="Transaction failed"
    message={error.message}
    on:close={back} />
{:else}
  <Modal>
    <span slot="title" use:twemoji>
      {#if state.status === Status.Success}
        <div>🎉</div>
      {:else}
        <div>🌐</div>
      {/if}
      Withdrawal
    </span>

    <span slot="subtitle">
      {#if state.status === Status.Signing}
        Signing transaction. Please confirm in your wallet.
      {:else if state.status === Status.Pending}
        Awaiting transaction.
      {/if}
    </span>

    <span slot="body" class="loader">
      {#if state.status === Status.Success}
        The amount of {amount} RAD tokens has been successfully transfered to
        <span class="txt-highlight">{signer?.getAddress()}</span>
      {:else}
        <Loading small center />
      {/if}
    </span>

    <span slot="actions">
      {#if state.status === Status.Success}
        <Button variant="foreground" on:click={back}>Back</Button>
      {/if}
    </span>
  </Modal>
{/if}
