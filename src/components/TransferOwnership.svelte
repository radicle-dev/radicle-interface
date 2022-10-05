<script lang="ts" strictEvents>
  import type { Org } from "@app/base/orgs/Org";
  import type { Config } from "@app/config";

  import { createEventDispatcher } from "svelte";

  import * as utils from "@app/utils";
  import Address from "@app/Address.svelte";
  import Button from "@app/Button.svelte";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import TextInput from "@app/TextInput.svelte";
  import { formatAddress, isAddress } from "@app/utils";

  export let org: Org;
  export let config: Config;

  const dispatch = createEventDispatcher<{ close: boolean }>();

  let state:
    | "idle"
    // Single sig.
    | "signing"
    | "pending"
    | "success"
    // Multi sig.
    | "proposing"
    | "proposed"
    | "failed" = "idle";

  let newOwner: string = "";
  let errorMessage: string | null = null;
  let valid: boolean = false;
  let validationMessage: string | undefined = undefined;

  const onSubmit = async () => {
    if (!valid) {
      return;
    }

    try {
      if (org && (await utils.isSafe(org.owner, config))) {
        state = "proposing";
        await org.setOwnerMultisig(newOwner, config);
        state = "proposed";
      } else {
        state = "signing";
        const tx = await org.setOwner(newOwner, config);
        state = "pending";
        await tx.wait();
        state = "success";
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = "Unknown error.";
      }
      console.error(error);
      state = "failed";
    }
  };

  function validate(address: string) {
    if (address === "") {
      return { valid: false };
    }

    if (state !== "idle") {
      return { valid: false };
    }

    if (!isAddress(address)) {
      return {
        valid: false,
        validationMessage: "Please enter a valid Ethereum address.",
      };
    }

    return { valid: true };
  }

  $: ({ valid, validationMessage } = validate(newOwner));
</script>

<style>
  .actions {
    gap: 1rem;
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
  .message {
    padding-left: 1rem;
    padding-top: 1rem;
    word-break: break-all;
  }
</style>

{#if state === "success" && newOwner}
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
{:else if state === "proposed" && org}
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
{:else if state === "failed"}
  <Modal floating error small>
    <div slot="title">
      🔑
      <div>Transfer ownership</div>
    </div>

    <div slot="subtitle">
      <div class="message">
        {errorMessage}
      </div>
    </div>

    <div slot="actions" class="actions">
      <Button
        variant="negative"
        on:click={() => {
          state = "idle";
        }}>
        Back
      </Button>
    </div>
  </Modal>
{:else}
  <Modal floating>
    <div slot="title">
      🔑
      <div>Transfer ownership</div>
    </div>

    <div slot="subtitle">
      {#if state === "signing"}
        Please confirm the transaction in your wallet.
      {:else if state === "pending"}
        Waiting for transaction to be processed…
      {:else if state === "proposing" && org}
        Proposal is being submitted to the safe
        <span class="txt-bold">{formatAddress(org.owner)}</span>
        , please sign the transaction in your wallet.
      {:else if state === "idle"}
        Transfer the ownership of Org <span class="txt-bold">
          {formatAddress(org.address)}
        </span>
        to a new address.
      {/if}
    </div>

    <div slot="body" style="display: flex;justify-content: center;">
      {#if state === "idle"}
        <div style="position: absolute; text-align: left;">
          <div style="width: 31rem;">
            <TextInput
              autofocus
              {valid}
              {validationMessage}
              on:submit={onSubmit}
              disabled={state !== "idle"}
              bind:value={newOwner} />
          </div>
        </div>
      {:else if state === "pending" || state === "proposing" || state === "signing"}
        <Loading small center />
      {/if}
    </div>

    <div slot="actions" class="actions">
      {#if state === "signing"}
        <Button variant="text" on:click={() => dispatch("close")}>
          Cancel
        </Button>
      {:else if state === "pending"}
        <Button variant="text" on:click={() => dispatch("close")}>Close</Button>
      {:else}
        <Button variant="primary" on:click={onSubmit} disabled={!valid}>
          Submit
        </Button>

        <Button variant="text" on:click={() => dispatch("close")}>
          Cancel
        </Button>
      {/if}
    </div>
  </Modal>
{/if}
