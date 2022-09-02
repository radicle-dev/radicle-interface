<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { formatAddress } from "@app/utils";
  import { session } from "@app/session";
  import type { Config } from "@app/config";

  import Connect from "@app/Connect.svelte";
  import Modal from "@app/Modal.svelte";
  import Loading from "@app/Loading.svelte";
  import Message from "@app/Message.svelte";
  import Button from "@app/Button.svelte";

  import { registrar } from "./registrar";

  enum State {
    CheckingAvailability,
    CheckingFailed,
    NameAvailable,
    NameUnavailable,
  }

  export let config: Config;
  export let name: string;
  export let owner: string | null;

  // We only support lower-case names.
  name = name.toLowerCase();

  let state = State.CheckingAvailability;
  let error: string | null = null;
  $: registrationOwner = owner || ($session && $session.address);

  function begin() {
    navigate(
      `/registrations/${name}/submit?${
        registrationOwner
          ? new URLSearchParams({ owner: registrationOwner })
          : ""
      }`,
    );
  }

  onMount(async () => {
    try {
      const isAvailable = await registrar(config).available(name);

      if (isAvailable) {
        state = State.NameAvailable;
      } else {
        state = State.NameUnavailable;
      }
    } catch (err: any) {
      state = State.CheckingFailed;
      error = err.message;
    }
  });
</script>

<svelte:head>
  <title>Radicle: Register {name}</title>
</svelte:head>

<Modal narrow>
  <span slot="title">
    <div>🌐</div>
    <span>Register a name</span>
  </span>

  <span slot="subtitle">
    {name}.{config.registrar.domain}
  </span>

  <span slot="body">
    {#if state === State.NameAvailable}
      {#if registrationOwner}
        The name <strong>{name}</strong>
        is available for registration under account
        <strong>{formatAddress(registrationOwner)}</strong>
        .
      {:else}
        The name <strong>{name}</strong>
        is available.
      {/if}
    {:else if state === State.NameUnavailable}
      This name is <strong>not available</strong>
      for registration.
    {:else if state === State.CheckingAvailability}
      <Loading small center />
    {:else if state === State.CheckingFailed && error}
      <Message error>
        <strong>Error:</strong>
        {error}
      </Message>
    {/if}
  </span>

  <span slot="actions">
    {#if state === State.NameAvailable}
      {#if $session}
        <Button on:click={begin} variant="primary">
          Begin registration &rarr;
        </Button>
      {:else}
        <Connect
          caption="Connect to register"
          buttonVariant="primary"
          {config} />
      {/if}

      <Button on:click={() => navigate("/registrations")} variant="text">
        Cancel
      </Button>
    {:else if state === State.NameUnavailable || state === State.CheckingFailed}
      <Button variant="foreground" on:click={() => navigate("/registrations")}>
        Back
      </Button>
    {/if}
  </span>
</Modal>
