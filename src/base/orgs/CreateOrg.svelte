<script lang="typescript">
  import { createEventDispatcher } from 'svelte';
  import Modal from '@app/Modal.svelte';
  import { Org } from '@app/base/orgs/Org';
  import type { Config } from '@app/config';

  export let config: Config;
  export let owner: string;

  enum State {
    Idle,
    Signing,
    Pending,
    Success,
  }

  let state = State.Idle;
  let error: Error | null = null;
  let org: Org | null = null;

  const dispatch = createEventDispatcher();
  const createOrg = async () => {
    state = State.Signing;

    try {
      let tx = await Org.create(owner, config);
      state = State.Pending;

      let receipt = await tx.wait();
      org = Org.fromReceipt(receipt);
      state = State.Success;
    } catch (e) {
      console.error(e);

      state = State.Idle;
      error = e;
    }
  };
</script>

<Modal floating {error} on:close>
  <span slot="title">
    {#if !org}
      Create an Org
    {:else}
      Success
    {/if}
  </span>

  <span slot="body">
    <table>
      <tr><td class="label">Member</td><td>{owner}</td></tr>
      {#if org}
        <tr><td class="label">Address</td><td>{org.address}</td></tr>
        <tr><td class="label">Safe</td><td>{org.safe}</td></tr>
      {/if}
    </table>
  </span>

  <span slot="actions">
    {#if !org}
      <button
        on:click={createOrg}
        class="primary"
        data-waiting={[State.Signing, State.Pending].includes(state) || null}
        disabled={state !== State.Idle}
      >
        {#if state === State.Pending}
          Creating...
        {:else}
          Create
        {/if}
      </button>

      <button on:click={() => dispatch('close')} class="text">
        Cancel
      </button>
    {:else}
      <button on:click={() => dispatch('close')}>
        Done
      </button>
    {/if}
  </span>
</Modal>
