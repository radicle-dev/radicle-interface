<script lang="ts">
  import type { Config } from "@app/config";
  import type { State } from "@app/utils";

  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";

  import Button from "@app/Button.svelte";
  import Err from "@app/Error.svelte";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import { Status } from "@app/utils";
  import { session } from "@app/session";
  import { withdraw } from "./lib";

  export let config: Config;

  let error: Error;
  const amount: string = window.history.state.amount;
  let state: State = {
    status: Status.Failed,
    error: "Error withdrawing, something happened.",
  };
  $: requester = $session && $session.address;

  const back = () => navigate(`/faucet`);

  onMount(async () => {
    try {
      if ($session) {
        state.status = Status.Signing;
        const tx = await withdraw(amount, $session.signer, config);
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
  <Err title="Transaction failed" message={error.message} on:close={back} />
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
        The amount of {amount} RAD tokens has been successfully transfered to
        <span class="highlight">{requester}</span>
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
