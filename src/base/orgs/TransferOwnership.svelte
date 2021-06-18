<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import Modal from '@app/Modal.svelte';
  import type { Config } from '@app/config';
  import { formatAddress } from '@app/utils';
  import Loading from '@app/Loading.svelte';
  import { assert } from '@app/error';
  import * as utils from '@app/utils';

  import type { Org } from './Org';

  const dispatch = createEventDispatcher();

  export let org: Org;
  export let config: Config;

  enum State {
    Idle,
    Signing,
    Pending,
    Success,
    Failed,
  }

  let newOwner: string | null = null;
  let state = State.Idle;
  let error: string | null = null;
  let input: HTMLInputElement | null = null;

  onMount(() => {
    input && input.focus();
  });

  const resetForm = () => {
    state = State.Idle;
  };

  const onSubmit = async () => {
    assert(newOwner);

    if (! utils.isAddress(newOwner)) {
      state = State.Failed;
      error = `"${newOwner}" is not a valid Ethereum address.`;
      return;
    }

    state = State.Signing;
    try {
      let tx = await org.setOwner(newOwner, config);
      state = State.Pending;
      await tx.wait();
      state = State.Success;
    } catch (e) {
      console.error(e);
      state = State.Failed;
      error = e.message;
    }
  };
</script>

{#if state === State.Success}
  <Modal floating small>
    <div slot="title">
      ✅
    </div>

    <div slot="subtitle">
      The ownership of <strong>{formatAddress(org.address)}</strong> was
      successfully transfered to <strong>{newOwner}</strong>.
    </div>

    <div slot="actions">
      <button class="small" on:click={() => dispatch('close')}>
        Done
      </button>
    </div>
  </Modal>
{:else}
  <Modal floating error={state == State.Failed} small={state == State.Failed}>
    <div slot="title">
      🔑
      <div>Transfer ownership</div>
    </div>

    <div slot="subtitle">
      {#if state == State.Signing}
        Please confirm the transaction in your wallet.
      {:else if state == State.Pending}
        Transaction is being processed by the network...
      {:else if state == State.Idle}
        Transfer the ownership of Org <strong>{formatAddress(org.address)}</strong> to a new address.
      {:else if state == State.Failed}
        <div class="error">
          {error}
        </div>
      {/if}
    </div>

    <div slot="body">
      {#if state == State.Idle}
        <input type="text" size="40" disabled={state !== State.Idle} bind:this={input} bind:value={newOwner} />
      {:else if state == State.Pending || state == State.Signing}
        <Loading small center />
      {:else if state == State.Failed}
        <!-- ... -->
      {/if}
    </div>

    <div slot="actions">
      {#if state == State.Signing}
        <button class="small" on:click={() => dispatch('close')}>
          Cancel
        </button>
      {:else if state == State.Pending}
        <button class="small" on:click={() => dispatch('close')}>
          Close
        </button>
      {:else if state == State.Failed}
        <button class="small" on:click={resetForm}>
          Back
        </button>
      {:else}
        <button class="primary" on:click={onSubmit} disabled={!newOwner || state !== State.Idle}>
          Submit
        </button>

        <button class="text" on:click={() => dispatch('close')}>
          Cancel
        </button>
      {/if}
    </div>
  </Modal>
{/if}
