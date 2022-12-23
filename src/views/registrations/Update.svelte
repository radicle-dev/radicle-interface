<script lang="ts">
  import type { EnsRecord } from "@app/lib/resolver";
  import type { Registration } from "@app/lib/registrar";
  import type { Wallet } from "@app/lib/wallet";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import { setRecords } from "@app/lib/resolver";

  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";

  export let domain: string;
  export let wallet: Wallet;
  export let records: EnsRecord[];
  export let registration: Registration;

  let state: "initial" | "signing" | "pending" | "success" = "initial";

  onMount(async () => {
    modal.disableHide();
    try {
      state = "signing";
      const tx = await setRecords(
        domain,
        records,
        registration.resolver,
        wallet,
      );
      state = "pending";
      await tx.wait();
      state = "success";
    } catch (error: any) {
      modal.show({
        component: ErrorModal,
        props: {
          title: "Updating registration failed",
          error: error.message,
        },
      });
    }
  });
</script>

<Modal
  emoji="🧾"
  title="Update registration"
  closeAction={state === "success"
    ? {
        name: "Done",
        callback: () => {
          location.reload();
        },
      }
    : false}>
  <span slot="subtitle">
    {#if state === "signing"}
      <p>Please confirm the transaction in your wallet</p>
    {:else if state === "pending"}
      <p>Waiting for transaction to be processed…</p>
    {:else if state === "success"}
      <p>Your registration was successfully updated</p>
    {/if}
  </span>

  <div slot="body">
    {#if ["signing", "pending"].includes(state)}
      <div style="margin-top: 1.5rem;">
        <Loading noDelay small center />
      </div>
    {/if}
  </div>
</Modal>
