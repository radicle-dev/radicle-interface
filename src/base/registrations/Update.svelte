<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { setRecords } from "./resolver";
  import type { EnsRecord } from "./resolver";
  import type { Registration } from "./registrar";
  import type { Config } from "@app/config";
  import Loading from "@app/Components/Loading.svelte";
  import Modal from "@app/Components/Modal/Modal.svelte";

  enum Status {
    Signing,
    Pending,
    Success,
    Failed,
  }

  type State =
    | { status: Status.Signing }
    | { status: Status.Pending }
    | { status: Status.Success }
    | { status: Status.Failed; error: string };

  export let subdomain: string;
  export let config: Config;
  export let records: EnsRecord[];
  export let registration: Registration;

  const dispatch = createEventDispatcher();

  let state: State = {
    status: Status.Failed,
    error: "Error registering, something happened.",
  };

  onMount(async () => {
    try {
      state.status = Status.Signing;
      const tx = await setRecords(
        subdomain,
        records,
        registration.resolver,
        config
      );
      state.status = Status.Pending;
      await tx.wait();
      state.status = Status.Success;
    } catch (e) {
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
    <div>🧾</div>
    <div>Update registration</div>
  </span>
  <span slot="subtitle">
    {#if state.status === Status.Signing}
      <p>Please confirm the transaction in your wallet</p>
    {:else if state.status === Status.Pending}
      <p>Transaction is being processed by the network...</p>
    {:else if state.status === Status.Success}
      <p>Your registration was successfully updated.</p>
    {:else if state.status === Status.Failed}
      <p class="error">
        <strong>Error:</strong>
        {state.error}
      </p>
    {/if}
  </span>
  <span slot="actions">
    {#if [Status.Signing, Status.Pending].includes(state.status)}
      <Loading center small />
    {:else if state.status === Status.Success}
      <button on:click={onDone}> Done </button>
    {:else if state.status === Status.Failed}
      <button on:click={onClose}> Close </button>
    {/if}
  </span>
</Modal>
