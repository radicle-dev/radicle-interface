<script lang="typescript">
  import { createEventDispatcher } from 'svelte';
  import { navigate } from 'svelte-routing';
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

  enum Governance {
    BDFL = "bdfl",
    Quorum = "quorum",
  }

  const orgTypes = [
    { label: "Single signer", value: Governance.BDFL },
    { label: "Quorum", value: Governance.Quorum },
  ];

  let state = State.Idle;
  let error: Err | null = null;
  let org: Org | null = null;
  let governance = Governance.BDFL;

  const dispatch = createEventDispatcher();
  const createOrg = async () => {
    state = State.Signing;

    try {
      let tx = governance === Governance.Quorum
        ? await Org.createMultiSig([owner], 1, config)
        : await Org.create(owner, config);

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
    switch (event.detail) {
      case "bdfl": governance = Governance.BDFL; break;
      case "quorum":  governance = Governance.Quorum; break;
    }
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
      <button on:click={() => navigate(`/orgs/${org?.address}`)}>
        Done
      </button>
    </span>
  </Modal>
{:else} <!-- Org creation flow -->
  <Modal floating on:close>
    <span slot="title">
      <div>🎪</div>
      <span>Create an Org</span>
    </span>

    <span slot="subtitle">
      {#if state === State.Idle}
        <div class="highlight">Select a governance model</div>
      {:else if state === State.Signing}
        <div class="highlight">Confirm transaction in your wallet</div>
      {:else if state === State.Pending}
        <div class="highlight">Waiting for transaction to be processed...</div>
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
          Close
        </button>
      {/if}
    </span>
  </Modal>
{/if}
