<script lang="typescript">
  import { createEventDispatcher } from 'svelte';
  import Modal from '@app/Modal.svelte';
  import Error from '@app/Error.svelte';
  import type { Err } from '@app/error';
  import { Org } from '@app/base/orgs/Org';
  import type { Config } from '@app/config';
  import Loading from '@app/Loading.svelte';
  import Options from '@app/Options.svelte';

  export let config: Config;
  export let owner: string;

  enum State {
    Idle,
    Signing,
    Pending,
    Success,
  }

  const orgTypes = [
    { label: "Single signer", value: "bdfl" },
    { label: "Quorum", value: "dao" },
  ];

  let state = State.Idle;
  let error: Err | null = null;
  let org: Org | null = null;
  let governance: string = "bdfl";

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

  const onGovernanceChanged = (event: { detail: string }) => {
    governance = event.detail;
  };
</script>

{#if error}
  <Error {error} floating on:close />
{:else if org} <!-- Org created -->
  <Modal floating on:close>
    <span slot="title">
      🎉
    </span>

    <span slot="subtitle">
      <strong>Your org was successfully created.</strong>
    </span>

    <span slot="body">
      <table>
        <tr><td class="label">Address</td><td>{org.address}</td></tr>
        <tr><td class="label">Owner</td><td>{org.safe}</td></tr>
      </table>
    </span>

    <span slot="actions">
      <button on:click={() => dispatch('close')}>
        Done
      </button>
    </span>
  </Modal>
{:else} <!-- Org creation flow -->
  <Modal floating on:close>
    <span slot="title">
      ✨
    </span>

    <span slot="subtitle">
      <h3>Create an Org</h3>
      {#if state === State.Idle}
        <div class="highlight">Select a governance model</div>
      {:else if state === State.Signing}
        <div class="highlight">Confirm transaction in your wallet</div>
      {:else if state === State.Pending}
        <div class="highlight">Waiting for transaction to be processed</div>
      {/if}
    </span>

    <span slot="body">
      {#if state === State.Idle}
        <Options name="governance" disabled={state !== State.Idle}
                 selected="{governance}" options={orgTypes}
                 on:changed={onGovernanceChanged} />
      {:else}
        <Loading center small />
      {/if}
    </span>

    <span slot="actions">
      {#if state === State.Idle}
        <button
          on:click={createOrg}
          class="primary"
          data-waiting={[State.Signing, State.Pending].includes(state) || null}
          disabled={state !== State.Idle}
        >
          Create
        </button>

        <button on:click={() => dispatch('close')} class="text">
          Cancel
        </button>
      {/if}
    </span>
  </Modal>
{/if}
