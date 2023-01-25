<script lang="ts">
  import { onMount } from "svelte";

  import * as router from "@app/lib/router";
  import Button from "@app/components/Button.svelte";
  import Connect from "@app/components/Connect.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Message from "@app/components/Message.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { formatAddress, twemoji } from "@app/lib/utils";
  import { registrar } from "@app/lib/registrar";
  import { networkStore } from "@app/lib/session";
  import { get } from "svelte/store";

  enum State {
    CheckingAvailability,
    CheckingFailed,
    NameAvailable,
    NameUnavailable,
  }

  export let name: string;
  export let owner: string | null;

  // We only support lower-case names.
  name = name.toLowerCase();

  let state = State.CheckingAvailability;
  let error: string | null = null;
  $: registrationOwner = owner || ($session && $session.address);
  const contracts = get(networkStore);

  function begin() {
    router.push({
      resource: "registrations",
      params: {
        view: {
          resource: "register",
          params: { nameOrDomain: name, owner: registrationOwner },
        },
      },
    });
  }

  onMount(async () => {
    try {
      const isAvailable = await registrar().available(name);

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

  function goToValidateName() {
    router.push({
      resource: "registrations",
      params: { view: { resource: "validateName" } },
    });
  }
</script>

<style>
  .actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }
</style>

<svelte:head>
  <title>Radicle: Register {name}</title>
</svelte:head>

<Modal narrow>
  <span slot="title">
    <div use:twemoji>🌐</div>
    <span>Register a name</span>
  </span>

  <span slot="subtitle">
    {`${name}.${contracts.registrar.domain}`}
  </span>

  <span slot="body">
    {#if state === State.NameAvailable}
      {#if registrationOwner}
        The name <span class="txt-bold">{name}</span>
        is available for registration under account
        <span class="txt-bold">{formatAddress(registrationOwner)}</span>
        .
      {:else}
        The name <span class="txt-bold">{name}</span>
        is available.
      {/if}
    {:else if state === State.NameUnavailable}
      This name is <span class="txt-bold">not available</span>
      for registration.
    {:else if state === State.CheckingAvailability}
      <Loading small center />
    {:else if state === State.CheckingFailed && error}
      <Message error>
        <span class="txt-bold">Error:</span>
        {error}
      </Message>
    {/if}
  </span>

  <span class="actions" slot="actions">
    {#if state === State.NameAvailable}
      {#if $session}
        <Button on:click={begin} variant="primary">
          Begin registration &rarr;
        </Button>
      {:else}
        <Connect caption="Connect to register" buttonVariant="primary" />
      {/if}

      <Button on:click={goToValidateName} variant="text">Cancel</Button>
    {:else if state === State.NameUnavailable || state === State.CheckingFailed}
      <Button variant="foreground" on:click={goToValidateName}>Back</Button>
    {/if}
  </span>
</Modal>
