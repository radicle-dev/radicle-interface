<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";
  import Modal from "@app/Components/Modal/Modal.svelte";
  import Error from "@app/Error.svelte";
  import type { Err } from "@app/error";
  import { Org } from "@app/base/orgs/Org";
  import type { Config } from "@app/config";
  import Loading from "@app/Components/Loading.svelte";
  import Options from "@app/Options.svelte";
  import Address from "@app/Address.svelte";

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
    {
      label: "Single-signature",
      description: [
        `Creates an org with the specified address as the only owner.`,
        `Org transactions such as anchoring can be signed and executed directly from your wallet.`,
      ],
      value: Governance.BDFL,
    },
    {
      label: "Multi-signature",
      description: [
        "Creates an org with a multi-signature contract as its owner, and the specified address as its only member.",
        "A [Gnosis Safe](https://gnosis-safe.io) contract will be deployed for your org.",
        "Transactions such as anchoring have to be approved by a quorum of signers.",
      ],
      value: Governance.Quorum,
    },
  ];

  let state = State.Idle;
  let error: Err | null = null;
  let org: Org | null = null;
  let governance = Governance.BDFL;

  const dispatch = createEventDispatcher();
  const createOrg = async () => {
    state = State.Signing;

    try {
      let tx =
        governance === Governance.Quorum
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
      case "bdfl":
        governance = Governance.BDFL;
        break;
      case "quorum":
        governance = Governance.Quorum;
        break;
    }
  };
</script>

{#if error}
  <Error {error} floating on:close />
{:else if org}
  <!-- Org created -->
  <Modal floating on:close>
    <span slot="title"> 🎉 </span>

    <span slot="subtitle">
      <strong>Your org was successfully created.</strong>
    </span>

    <span slot="body">
      <div class="fields">
        <span class="label">Address</span>
        <span><Address address={org.address} {config} /></span>

        <span class="label">Owner</span>
        <span><Address address={org.owner} {config} /></span>
      </div>
    </span>

    <span slot="actions">
      <button on:click={() => navigate(`/orgs/${org?.address}`)}> Done </button>
    </span>
  </Modal>
{:else}
  <!-- Org creation flow -->
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
        <div class="configuration">
          <div class="governance">
            <Options
              name="governance"
              disabled={state !== State.Idle}
              selected={governance}
              options={orgTypes}
              on:changed={onGovernanceChanged}
            />
          </div>

          <label class="input" for="address"
            >Org owner or member Ethereum address</label
          >
          <input
            name="address"
            class="small"
            type="text"
            maxlength="42"
            bind:value={owner}
          />
        </div>
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

        <button on:click={() => dispatch("close")} class="text"> Close </button>
      {/if}
    </span>
  </Modal>
{/if}

<style>
  .fields {
    display: grid;
    grid-template-columns: 1fr 7fr;
    grid-gap: 0.5rem 2rem;
  }
  .fields > span {
    justify-self: start;
    align-self: center;
    height: 2rem;
    line-height: 2rem;
  }
  .configuration {
    max-width: 35rem;
    text-align: left;
  }
  .governance {
    background-color: var(--color-secondary-background);
    border-radius: 1rem;
    padding: 1rem 1rem 0rem 1rem;
    margin-bottom: 2rem;
  }
  label[for="address"] {
    margin-left: 1.5rem;
    font-size: 0.75rem;
    color: var(--color-secondary);
  }
  input[name="address"] {
    margin: 0.5rem 0 0 0;
    width: 100%;
  }
</style>
