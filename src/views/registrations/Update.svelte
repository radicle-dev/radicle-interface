<script lang="ts" strictEvents>
  import type { EnsRecord } from "@app/lib/resolver";
  import type { Registration } from "@app/lib/registrar";
  import type { Wallet } from "@app/lib/wallet";
  import type { State } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { Status } from "@app/lib/utils";
  import { onMount, createEventDispatcher } from "svelte";
  import { setRecords } from "@app/lib/resolver";
  import { twemoji } from "@app/lib/utils";

  export let domain: string;
  export let wallet: Wallet;
  export let records: EnsRecord[];
  export let registration: Registration;

  const dispatch = createEventDispatcher<{ close: never }>();

  let state: State = {
    status: Status.Failed,
    error: "Error registering, something happened.",
  };

  onMount(async () => {
    try {
      state.status = Status.Signing;
      const tx = await setRecords(
        domain,
        records,
        registration.resolver,
        wallet,
      );
      state.status = Status.Pending;
      await tx.wait();
      state.status = Status.Success;
    } catch (e: any) {
      console.error(e);
      state = { status: Status.Failed, error: e.message };
    }
  });

  const onDone = () => {
    // Reload page to load updates to the registration.
    location.reload();
  };

  const onClose = () => {
    dispatch("close");
  };
</script>

<Modal floating error={state.status === Status.Failed}>
  <span slot="title">
    <div use:twemoji>🧾</div>
    <div>Update registration</div>
  </span>
  <span slot="subtitle">
    {#if state.status === Status.Signing}
      <p>Please confirm the transaction in your wallet</p>
    {:else if state.status === Status.Pending}
      <p>Waiting for transaction to be processed…</p>
    {:else if state.status === Status.Success}
      <p>Your registration was successfully updated.</p>
    {:else if state.status === Status.Failed}
      <span class="txt-bold">Error:</span>
      {state.error}
    {/if}
  </span>
  <span slot="actions">
    {#if [Status.Signing, Status.Pending].includes(state.status)}
      <Loading center small />
    {:else if state.status === Status.Success}
      <Button variant="foreground" on:click={onDone}>Done</Button>
    {:else if state.status === Status.Failed}
      <Button variant="negative" on:click={onClose}>Close</Button>
    {/if}
  </span>
</Modal>
