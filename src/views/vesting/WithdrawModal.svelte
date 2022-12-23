<script lang="ts" strictEvents>
  import type { Wallet } from "@app/lib/wallet";

  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";

  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { onMount } from "svelte";
  import { state } from "@app/lib/vesting";
  import { withdrawVested } from "@app/lib/vesting";

  export let contractAddress: string;
  export let beneficiary: string;
  export let wallet: Wallet;
  export let balance: string;
  export let currency: string;

  onMount(async () => {
    modal.disableHide();
    await withdrawVested(contractAddress, wallet);
    modal.enableHide();
  });
</script>

<Modal
  emoji="💰"
  title="Withdraw funds"
  closeAction={$state.type === "withdrawn" ? { name: "Done" } : false}>
  <span slot="subtitle">
    {#if $state.type === "withdrawingSign"}
      Send {balance}
      {currency} to
      {utils.formatAddress(beneficiary)}.
      <br />
      Please confirm in your wallet.
    {:else if $state.type === "withdrawing"}
      Waiting for transaction to be processed…
    {/if}
  </span>

  <span slot="body">
    {#if $state.type === "withdrawn"}
      <span>
        Tokens have been withdrawn to <span class="txt-highlight">
          {utils.formatAddress(beneficiary)}
        </span>
      </span>
    {:else}
      <div style:margin-top="1.5rem">
        <Loading noDelay small center />
      </div>
    {/if}
  </span>
</Modal>
