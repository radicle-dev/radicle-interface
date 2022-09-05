<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { router } from "tinro";
  import Modal from "@app/Modal.svelte";
  import Error from "@app/Error.svelte";
  import type { Err } from "@app/error";
  import { Org } from "@app/base/orgs/Org";
  import type { Config } from "@app/config";
  import Loading from "@app/Loading.svelte";
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
    Existing = "existing",
    Quorum = "quorum",
  }

  const orgTypes = [
    {
      label: "Multi-signature",
      description: [
        "Creates an org with a multi-signature contract as its owner, and the specified account as the first member.",
        "A [Gnosis Safe](https://gnosis-safe.io) will be deployed for your org.",
        "Transactions such as anchoring have to be approved by a quorum of signers.",
      ],
      value: Governance.Quorum,
    },
    {
      label: "Existing owner",
      description: [
        `Creates an org with the specified account as the sole owner.`,
        `Org transactions such as anchoring are signed and executed from that account.`,
        `This option allows for using an existing contract or EOA as the owner of the org.`,
      ],
      value: Governance.Existing,
    },
  ];

  let state = State.Idle;
  let error: Err | null = null;
  let org: Org | null = null;
  let governance = Governance.Quorum;

  const dispatch = createEventDispatcher();
  const createOrg = async () => {
    state = State.Signing;

    try {
      const tx =
        governance === Governance.Quorum
          ? await Org.createMultiSig([owner], 1, config)
          : await Org.create(owner, config);

      state = State.Pending;

      const receipt = await tx.wait();
      org = Org.fromReceipt(receipt);
      state = State.Success;
    } catch (e: any) {
      console.error(e);

      state = State.Idle;
      error = e;
    }
  };

  const onGovernanceChanged = (event: { detail: string }) => {
    switch (event.detail) {
      case "existing":
        governance = Governance.Existing;
        break;
      case "quorum":
        governance = Governance.Quorum;
        break;
    }
  };
</script>

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
    border-radius: var(--border-radius);
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
  .notice {
    font-size: 0.875rem;
    border-radius: var(--border-radius);
    color: var(--color-yellow);
    background-color: var(--color-yellow-background);
    padding: 1rem;
    margin-bottom: 1rem;
  }
</style>

{#if error}
  <Error {error} floating on:close />
{:else if org}
  <!-- Org created -->
  <Modal floating on:close>
    <span slot="title">🎉</span>

    <span slot="subtitle">
      <strong>Your org was successfully created.</strong>
    </span>

    <span slot="body">
      <div class="fields">
        <span class="label">Address</span>
        <span><Address address={org.address} {config} /></span>

        <span class="label">Owner</span>
        <span><Address resolve address={org.owner} {config} /></span>
      </div>
    </span>

    <span slot="actions">
      <button on:click={() => router.goto(`/${org?.address}`)}>Done</button>
    </span>
  </Modal>
{:else}
  <!-- Org creation flow -->
  <Modal floating on:close center>
    <span slot="title">
      <div>🎪</div>
      <span>Create an Org</span>
    </span>

    <span slot="subtitle">
      {#if state === State.Idle}
        <div class="highlight">Select how you'd like to create your org</div>
      {:else if state === State.Signing}
        <div class="highlight">
          Please confirm the transaction in your wallet.
        </div>
      {:else if state === State.Pending}
        <div class="highlight">Waiting for transaction to be processed...</div>
      {/if}
    </span>

    <span slot="body">
      {#if state === State.Idle}
        <div class="configuration">
          <div class="notice">
            <strong>Notice:</strong>
            Orgs V1 are being deprecated. It is recommended not to create new orgs
            at this point.
          </div>

          <div class="governance">
            <Options
              name="governance"
              disabled={state !== State.Idle}
              selected={governance}
              options={orgTypes}
              on:changed={onGovernanceChanged} />
          </div>

          <label class="input" for="address">Ethereum account address</label>
          <input
            name="address"
            class="small"
            type="text"
            maxlength="42"
            bind:value={owner} />
        </div>
      {:else}
        <Loading center small />
      {/if}
    </span>

    <span slot="actions">
      {#if state === State.Idle}
        <button
          on:click={createOrg}
          class="primary regular"
          data-waiting={[State.Signing, State.Pending].includes(state) || null}
          disabled={state !== State.Idle}>
          Create
        </button>

        <button on:click={() => dispatch("close")} class="text regular">
          Close
        </button>
      {/if}
    </span>
  </Modal>
{/if}
