<script lang="ts">
  import { ethers } from "ethers";
  import type { Safe } from "@app/utils";
  import type { PendingProject } from "@app/project";
  import type { Config } from "@app/config";
  import * as utils from "@app/utils";
  import Modal from "@app/Modal.svelte";
  import Avatar from "@app/Avatar.svelte";
  import { createEventDispatcher } from 'svelte';

  export let safe: Safe;
  export let project: PendingProject;
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
  let action: null | Action = null;
  const isSigned = project.confirmations.includes(
    ethers.utils.getAddress(account)
  );
  const close = () => {
    action = null;
    state = State.Idle;
    // Could eventually be a separate function if we want to handle a Cancel event differently.
    dispatch("success");
  };
  const pending = safe.threshold - project.confirmations.length;
  const executeTransaction = async (safeTxHash: string) => {
    try {
      action = Action.Execute;
      state = State.Confirm;
      const txResult = await utils.executeSignedSafeTransaction(safe.address, safeTxHash, config);

      state = State.Submitting;
      await txResult.transactionResponse?.wait();

      state = State.Success;
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      state = State.Failed;
    }
  };
</script>

<style>
  .confirmations {
    white-space: nowrap;
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
  }
  .no-wrap {
    white-space: nowrap;
  }
</style>

<span class="confirmations">
  {#if pending > 0}
    <span class="desktop"><strong>{pending}</strong> signature(s) pending</span>
    <span class="mobile"><strong>{pending}</strong> sig(s) pending</span>
  {/if}
</span>

<div class="avatars">
  {#each project.confirmations as signee}
    <Avatar inline source={signee} address={signee} glowOnHover />
  {/each}
</div>

<!-- Check whether the threshold has been matched or passed -->
{#if pending <= 0}
  <button on:click|stopPropagation={() => {
    action = Action.Execute;
    state = State.Confirm;
  }} class="tiny">
    Execute
  </button>
  <!-- Check whether or not we've signed this proposal -->
{:else if isSigned}
  <span class="badge safe no-margin no-wrap">✓ signed</span>
{:else}
  <button on:click|stopPropagation={() => {
    action = Action.Sign;
    state = State.Confirm;
    }} class="desktop tiny">
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
      {/if}
    </span>

    <span slot="body">
      {#if state == State.Confirm}
        <div class="table">
          <div>Project</div><code>{project.id}</code>
          <div>Hash</div><code>{project.anchor.stateHash}</code>
        </div>
      {/if}
    </span>

    <span slot="actions">
      {#if state == State.Confirm}
        <button class="primary" on:click={() => confirmAnchor(project.safeTxHash)}>
          Confirm
        </button>
        <button class="text" on:click={close}>
          Cancel
        </button>
      {:else if state == State.Success}
        <button on:click={close}>Done</button>
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
        <span>Sign the transaction in your wallet...</span>
      {:else if state == State.Submitting}
        <span>Transaction is being confirmed...</span>
      {:else if state == State.Success}
        <span>Transaction confirmed.</span>
      {/if}
    </span>

    <span slot="body">
      {#if state == State.Confirm}
        <div class="table">
          <div>TxHash</div><code>{utils.formatHash(project.safeTxHash)}</code>
          <div>Quorum</div><code>{project.confirmations.length} of {safe.threshold}</code>
        </div>
      {/if}
    </span>

    <span slot="actions">
      {#if state == State.Confirm}
        <button class="primary" on:click={() => executeTransaction(project.safeTxHash)}>
          Confirm
        </button>
        <button class="text" on:click={close}>
          Cancel
        </button>
      {:else if state == State.Success}
        <button on:click={close}>Done</button>
      {/if}
    </span>
  </Modal>
{/if}
