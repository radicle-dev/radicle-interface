<script lang="typescript">
  import { createEventDispatcher } from 'svelte';
  import { session } from '@app/session';
  import Modal from '@app/Modal.svelte';
  import { Org } from '@app/base/orgs/Org';

  export let config;
  export let owner;

  enum State {
    Idle,
    Waiting,
    Success,
  }

  let state = State.Idle;
  let error = null;

  const dispatch = createEventDispatcher();
  const createOrg = async () => {
    state = State.Waiting;

    console.log("creating org");
    try {
      let tx = await Org.create(owner, config);
      let receipt = await tx.wait();
      console.log(receipt);
      let org = Org.fromReceipt(receipt);
      console.log(org);
      state = State.Success;
    } catch (e) {
      state = State.Idle;
      console.error(e);
      error = e;
    }
  };
</script>

<Modal floating {error} on:close>
  <span slot="title">
    Create an Org
  </span>
  <span slot="body">
    <table>
      <tr><td class="label">Owner</td><td>{owner}</td></tr>
    </table>
  </span>
  <span slot="actions">
    <button
      on:click={createOrg}
      class="primary"
      data-waiting={state === State.Waiting || null}
      disabled={state !== State.Idle}
    >Create</button>

    <button on:click={() => dispatch('close')} class="text">
      Cancel
    </button>
  </span>
</Modal>
