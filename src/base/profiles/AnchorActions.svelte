<script lang="ts">
  import { ethers } from "ethers";
  import type { Safe } from "@app/utils";
  import type { PendingAnchor } from "@app/project";
  import type { Config } from "@app/config";
  import * as utils from "@app/utils";
  import Modal from "@app/Modal.svelte";
  import Avatar from "@app/Avatar.svelte";
  import { createEventDispatcher } from 'svelte';

  export let safe: Safe;
  export let anchor: PendingAnchor;
  export let account: string;
  export let config: Config;

  enum State {
    Idle,
    Confirm,
    Signing,
    Submitting,
    Success,
    Execute,
    Failed,
  }

  enum Action {
    Sign,
    Execute,
  }

  const dispatch = createEventDispatcher();
  let state = State.Idle;
  let error: string | null = null;
  let action: null | Action = null;

  const close = () => {
    action = null;
    state = State.Idle;
  };

  const pending = safe.threshold - anchor.confirmations.length;
  const executeTransaction = async (safeTxHash: string) => {
    try {
      action = Action.Execute;
      state = State.Signing;
      const txResult = await utils.executeSignedSafeTransaction(safe.address, safeTxHash, config);

      state = State.Submitting;
      await txResult.transactionResponse?.wait();

      state = State.Success;
    } catch (err: any) {
      console.error(err);
      error = err.message;
      state = State.Failed;
    }
  };

  const confirmAnchor = async (safeTxHash: string) => {
    try {
      action = Action.Sign;
      state = State.Signing;
      const signature = await utils.signSafeTransaction(safe.address, safeTxHash, config);

      state = State.Submitting;
      await config.safe.client?.confirmTransaction(safeTxHash, signature.data);

      state = State.Success;
    } catch (err: any) {
      console.error(err);
      error = err.message;
      state = State.Failed;
    }
  };

  $: isSigned = anchor.confirmations.includes(
    ethers.utils.getAddress(account)
  );
</script>

<style>
  .confirmations {
    margin-right: 0.5rem;
  }
  .table {
    display: grid;
    grid-template-columns: 5rem 4fr;
    grid-gap: 1rem;
    text-align: left;
  }
  .table > *:nth-child(odd) { /* Labels */
    color: var(--color-secondary);
  }
  .table > *:nth-child(even) { /* Values */
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .avatars {
    display: flex;
    margin-right: 0.75rem;
  }
  button.execute {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<span class="confirmations">
  {#if pending > 0}
    <strong>{pending}</strong> signature(s) pending
  {/if}
</span>

<div class="avatars">
  {#each anchor.confirmations as signee}
    <Avatar inline source={signee} title={signee} />
  {/each}
</div>

<!-- Check whether the threshold has been matched or passed -->
{#if pending <= 0}
  <button on:click|stopPropagation={() => {
    action = Action.Execute;
    state = State.Confirm;
  }} class="small execute">
    <Avatar inline source={account} title={account} /> Execute
  </button>
  <!-- Check whether or not we've signed this proposal -->
{:else if isSigned}
  <span class="badge safe no-margin">✓ signed</span>
{:else}
  <button on:click|stopPropagation={() => {
    action = Action.Sign;
    state = State.Confirm;
    }} class="small">
    Confirm
  </button>
{/if}

<!-- We've initiated an action -->
{#if state !== State.Idle && action === Action.Sign}
  <Modal floating>
    <span slot="title">
      <div>⚓</div>
      <div>Anchor project</div>
    </span>

    <span slot="subtitle">
      {#if state == State.Confirm}
        <span>Initiate the transaction...</span>
      {:else if state == State.Signing}
        <span>Sign the transaction in your wallet...</span>
      {:else if state == State.Submitting}
        <span>Transaction is being confirmed...</span>
      {:else if state == State.Success}
        <span>Transaction confirmed.</span>
      {:else if state == State.Failed}
        <span>Transaction failed</span>
      {/if}
    </span>

    <span slot="body">
      {#if state == State.Confirm}
        <div class="table">
          <div>Project</div><code>{anchor.id}</code>
          <div>Hash</div><code>{anchor.anchor.stateHash}</code>
        </div>
      {:else if state == State.Failed}
        <div>{error}</div>
      {/if}
    </span>

    <span slot="actions">
      {#if state == State.Confirm}
        <button class="primary" on:click={() => confirmAnchor(anchor.safeTxHash)}>
          Confirm
        </button>
        <button class="text" on:click={close}>
          Cancel
        </button>
      {:else if state == State.Success || state == State.Failed}
        <button on:click={() => {
          close();
          dispatch("success");
        }}>Done</button>
      {/if}
    </span>
  </Modal>
{:else if state !== State.Idle && action === Action.Execute}
  <Modal floating>
    <span slot="title">
      <div>⚡</div>
      <div>Execute Safe Transaction</div>
    </span>

    <span slot="subtitle">
      {#if state == State.Confirm}
        <span>Initiate the transaction...</span>
      {:else if state == State.Signing}
        <span>Sign the transaction in your wallet...</span>
      {:else if state == State.Submitting}
        <span>Transaction is being confirmed...</span>
      {:else if state == State.Success}
        <span>Transaction confirmed.</span>
      {:else if state == State.Failed}
        <span>Transaction failed</span>
      {/if}
    </span>

    <span slot="body">
      {#if state == State.Confirm}
        <div class="table">
          <div>TxHash</div><code>{utils.formatHash(anchor.safeTxHash)}</code>
          <div>Quorum</div><code>{anchor.confirmations.length} of {safe.threshold}</code>
        </div>
      {:else if state == State.Failed}
        <div>{error}</div>
      {/if}
    </span>

    <span slot="actions">
      {#if state == State.Confirm}
        <button class="primary" on:click={() => executeTransaction(anchor.safeTxHash)}>
          Confirm
        </button>
        <button class="text" on:click={close}>
          Cancel
        </button>
      {:else if state == State.Success || state == State.Failed}
        <button on:click={() => {
          close();
          dispatch("success");
        }}>Done</button>
      {/if}
    </span>
  </Modal>
{/if}
