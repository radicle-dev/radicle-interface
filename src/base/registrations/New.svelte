<script lang="ts">
  import type { Wallet } from "@app/wallet";

  import { onMount } from "svelte";

  import * as router from "@app/router";
  import Button from "@app/Button.svelte";
  import Connect from "@app/Connect.svelte";
  import Loading from "@app/Loading.svelte";
  import Message from "@app/Message.svelte";
  import Modal from "@app/Modal.svelte";
  import { formatAddress, twemoji } from "@app/utils";
  import { registrar } from "./registrar";
  import { session } from "@app/session";

  enum State {
    CheckingAvailability,
    CheckingFailed,
    NameAvailable,
    NameUnavailable,
  }

  export let wallet: Wallet;
  export let name: string;
  export let owner: string | null;

  // We only support lower-case names.
  name = name.toLowerCase();

  let state = State.CheckingAvailability;
  let error: string | null = null;
  $: registrationOwner = owner || ($session && $session.address);

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
      const isAvailable = await registrar(wallet).available(name);

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
    {name}.{wallet.registrar.domain}
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
        <Connect
          caption="Connect to register"
          buttonVariant="primary"
          {wallet} />
      {/if}

      <Button on:click={goToValidateName} variant="text">Cancel</Button>
    {:else if state === State.NameUnavailable || state === State.CheckingFailed}
      <Button variant="foreground" on:click={goToValidateName}>Back</Button>
    {/if}
  </span>
</Modal>
