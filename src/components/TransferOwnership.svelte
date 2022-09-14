<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import Modal from "@app/Modal.svelte";
  import type { Config } from "@app/config";
  import { formatAddress, isAddress } from "@app/utils";
  import Loading from "@app/Loading.svelte";
  import { assert } from "@app/error";
  import * as utils from "@app/utils";
  import Address from "@app/Address.svelte";
  import Button from "@app/Button.svelte";

  import type { Org } from "@app/base/orgs/Org";

  const dispatch = createEventDispatcher();

  export let org: Org;
  export let config: Config;

  enum State {
    Idle,

    // Single sig states.
    Signing,
    Pending,
    Success,

    // Multi sig states.
    Proposing,
    Proposed,

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

    if (!isAddress(newOwner)) {
      state = State.Failed;
      error = `"${newOwner}" is not a valid Ethereum address.`;
      return;
    }

    try {
      if (org && (await utils.isSafe(org.owner, config))) {
        state = State.Proposing;
        await org.setOwnerMultisig(newOwner, config);
        state = State.Proposed;
      } else {
        state = State.Signing;
        const tx = await org.setOwner(newOwner, config);
        state = State.Pending;
        await tx.wait();
        state = State.Success;
      }
    } catch (e: any) {
      console.error(e);
      state = State.Failed;
      error = e.message;
    }
  };
</script>

{#if state === State.Success && newOwner}
  <Modal floating small>
    <div slot="title">✅</div>

    <div slot="subtitle">
      The ownership of <span class="txt-bold">
        {formatAddress(org.address)}
      </span>
      was successfully transfered to
      <span class="txt-bold">{newOwner}</span>
      .
    </div>

    <div slot="actions">
      <Button variant="secondary" on:click={() => dispatch("close")}>
        Done
      </Button>
    </div>
  </Modal>
{:else if state === State.Proposed && org}
  <Modal floating>
    <div slot="title">🪴</div>

    <div slot="subtitle">
      <p>
        The transaction to set the owner of <span class="txt-bold">
          {formatAddress(org.address)}
        </span>
        to
        <span class="txt-bold">{newOwner}</span>
        was proposed to:
      </p>
      <p><Address address={org.owner} {config} compact /></p>
    </div>

    <div slot="actions">
      <Button variant="secondary" on:click={() => dispatch("close")}>
        Done
      </Button>
    </div>
  </Modal>
{:else}
  <Modal floating error={state === State.Failed} small={state === State.Failed}>
    <div slot="title">
      🔑
      <div>Transfer ownership</div>
    </div>

    <div slot="subtitle">
      {#if state === State.Signing}
        Please confirm the transaction in your wallet.
      {:else if state === State.Pending}
        Waiting for transaction to be processed…
      {:else if state === State.Proposing && org}
        Proposal is being submitted to the safe
        <span class="txt-bold">{formatAddress(org.owner)}</span>
        , please sign the transaction in your wallet.
      {:else if state === State.Idle}
        Transfer the ownership of Org <span class="txt-bold">
          {formatAddress(org.address)}
        </span>
        to a new address.
      {:else if state === State.Failed}
        <div class="error">
          {error}
        </div>
      {/if}
    </div>

    <div slot="body">
      {#if state === State.Idle}
        <input
          type="text"
          size="40"
          disabled={state !== State.Idle}
          bind:this={input}
          bind:value={newOwner} />
      {:else if state === State.Pending || state === State.Proposing || state === State.Signing}
        <Loading small center />
      {:else if state === State.Failed}
        <!-- ... -->
      {/if}
    </div>

    <div slot="actions">
      {#if state === State.Signing}
        <Button variant="text" on:click={() => dispatch("close")}>
          Cancel
        </Button>
      {:else if state === State.Pending}
        <Button variant="text" on:click={() => dispatch("close")}>Close</Button>
      {:else if state === State.Failed}
        <Button variant="negative" on:click={resetForm}>Back</Button>
      {:else}
        <Button
          variant="primary"
          on:click={onSubmit}
          disabled={!newOwner || state !== State.Idle}>
          Submit
        </Button>

        <Button variant="text" on:click={() => dispatch("close")}>
          Cancel
        </Button>
      {/if}
    </div>
  </Modal>
{/if}
