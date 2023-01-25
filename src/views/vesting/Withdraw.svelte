<script lang="ts" strictEvents>
  import type { VestingInfo } from "@app/lib/vesting";

  import * as utils from "@app/lib/utils";
  import Button from "@app/components/Button.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { state } from "@app/lib/vesting";
  import { withdrawVested } from "@app/lib/vesting";
  import { providerStore, sessionStore } from "@app/lib/session";

  export let contractAddress: string;
  export let info: VestingInfo;

  let signer = $sessionStore?.signer;

  const dispatch = createEventDispatcher<{ close: never }>();

  onMount(async () => {
    await withdrawVested(contractAddress, $providerStore, signer);
  });
</script>

<style>
  .actions {
    display: flex;
    justify-content: center;
    flex-direction: row;
    gap: 1rem;
  }
</style>

{#if $state.type === "error"}
  <ErrorModal
    floating
    title="Withdraw failed"
    message={$state.error}
    on:close={() => dispatch("close")} />
{:else}
  <Modal on:close floating>
    <span slot="title">
      {utils.formatAddress(contractAddress)}
    </span>

    <span slot="subtitle">
      {#if $state.type === "withdrawingSign"}
        <span class="txt-missing">Waiting for a signature…</span>
      {:else if $state.type === "withdrawing"}
        <span class="txt-missing">Waiting for confirmation…</span>
      {/if}
    </span>

    <span slot="body">
      {#if $state.type === "withdrawn"}
        <span>
          Tokens have been withdrawn to <span class="txt-highlight">
            {utils.formatAddress(info.beneficiary)}
          </span>
        </span>
      {:else}
        <Loading small center />
      {/if}
    </span>

    <span class="actions" slot="actions">
      <Button variant="foreground" on:click={() => dispatch("close")}>
        Close
      </Button>
    </span>
  </Modal>
{/if}
