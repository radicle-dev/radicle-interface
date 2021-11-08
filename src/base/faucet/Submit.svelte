<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import type { Config } from "@app/config";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import Err from "@app/Error.svelte";
  import { Status, State } from "@app/utils";
  import { withdraw } from "./Faucet";
  import { session } from '@app/session';

  export let config: Config;

  let error: Error;
  let state: State = {
    status: Status.Failed,
    error: "Error withdrawing, something happened.",
  };
  $: requester = ($session && $session.address);

  const back = () => navigate(`/faucet`);

  onMount(async () => {
    try {
      state.status = Status.Signing;
      const tx = await withdraw(window.history.state.amount, config);
      state.status = Status.Pending;
      await tx.wait();
      state.status = Status.Success;
    } catch (e) {
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
  <Err
    title="Transaction failed"
    message={error.message}
    on:close={() => navigate("/faucet")}
  />
{:else}
  <Modal>
    <span slot="title">
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
        The amount of {window.history.state.amount.toString()} RAD tokens has been successfully transfered to
        <span class="highlight">{requester}</span>
      {:else}
        <Loading small center />
      {/if}
    </span>

    <span slot="actions">
      {#if state.status === Status.Success}
        <button on:click={back} class="register"> Back </button>
      {/if}
    </span>
  </Modal>
{/if}
