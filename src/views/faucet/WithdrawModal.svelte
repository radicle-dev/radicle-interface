<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";
  import { session } from "@app/lib/session";
  import { withdraw } from "@app/lib/faucet";

  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";

  export let wallet: Wallet;
  export let amount: string;

  let state: "initial" | "signing" | "pending" | "success" = "initial";

  onMount(async () => {
    modal.disableHide();
    try {
      if ($session) {
        state = "signing";
        const tx = await withdraw(amount, $session.signer, wallet);
        state = "pending";
        await tx.wait();
        state = "success";
        modal.enableHide();
      } else {
        modal.enableHide();
        modal.hide();
      }
    } catch (error: unknown) {
      let message: string | undefined;

      if (error instanceof Error) {
        message = error.message;
      } else {
        message = "Unknown error. Check dev console for details.";
        console.error(error);
      }

      modal.show({
        component: ErrorModal,
        props: {
          title: "Transaction failed",
          error: message,
        },
      });
    }
  });
</script>

<Modal
  emoji={state === "success" ? "🎉" : "🌐"}
  title="Withdraw"
  closeAction={state === "success" ? { name: "Done" } : false}>
  <span slot="subtitle">
    {#if state === "signing"}
      {#if $session?.address}
        Send {amount} RAD to {utils.formatAddress($session.address)}.
        <br />
      {/if}
      Please confirm the transaction in your wallet.
    {:else if state === "pending"}
      Waiting for transaction to be processed…
    {/if}
  </span>

  <span slot="body">
    {#if state === "success"}
      {amount} RAD has been sent to
      {#if $session?.address}
        <span class="txt-highlight">
          {utils.formatAddress($session.address)}.
        </span>
      {/if}
    {:else}
      <div style:margin-top="2rem">
        <Loading noDelay small center />
      </div>
    {/if}
  </span>
</Modal>
