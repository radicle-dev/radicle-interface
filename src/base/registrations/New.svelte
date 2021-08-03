<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { formatAddress, formatBalance } from '@app/utils';
  import { session } from '@app/session';
  import type { Config } from '@app/config';

  import Connect from '@app/Connect.svelte';
  import Modal from '@app/Modal.svelte';
  import Loading from '@app/Loading.svelte';
  import Message from '@app/Message.svelte';

  import { registrar, registrationFee } from './registrar';

  enum State {
    CheckingAvailability,
    CheckingFailed,
    NameAvailable,
    NameUnavailable,
  }

  export let config: Config;
  export let subdomain: string;
  export let owner: string | null;

  // We only support lower-case names.
  subdomain = subdomain.toLowerCase();

  let fee: string;
  let state = State.CheckingAvailability;
  let error: string | null = null;
  $: registrationOwner = owner || ($session && $session.address);

  function begin() {
    navigate(`/registrations/${subdomain}/submit?${
      registrationOwner ? new URLSearchParams({ owner: registrationOwner }) : ''
    }`);
  }

  onMount(async () => {
    try {
      const [_fee, isAvailable] = await Promise.all([
        registrationFee(config),
        registrar(config).available(subdomain),
      ]);

      fee = formatBalance(_fee);

      if (isAvailable) {
        state = State.NameAvailable;
      } else {
        state = State.NameUnavailable;
      }
    } catch (err) {
      state = State.CheckingFailed;
      error = err.message;
    }
  });
</script>

<Modal narrow>
  <span slot="title">
    <div>🌐</div>
    <span>Register a name</span>
  </span>

  <span slot="subtitle">
    {subdomain}.{config.registrar.domain}
  </span>

  <span slot="body">
    {#if state === State.NameAvailable}
      {#if registrationOwner}
        The name <strong>{subdomain}</strong> is available for registration
        under account <strong>{formatAddress(registrationOwner)}</strong>
        for <strong>{fee} RAD</strong>.
      {:else}
        The name <strong>{subdomain}</strong> is available
        for <strong>{fee} RAD</strong>.
      {/if}
    {:else if state === State.NameUnavailable}
      This name is <strong>not available</strong> for registration.
    {:else if state === State.CheckingAvailability}
      <Loading small center />
    {:else if state === State.CheckingFailed && error}
      <Message error>
        <strong>Error:</strong> {error}
      </Message>
    {/if}
  </span>

  <span slot="actions">
    {#if state === State.NameAvailable}
      {#if $session}
        <button on:click={begin} class="primary register">
          Begin registration &rarr;
        </button>
      {:else}
        <Connect caption="Connect to register" className="primary" {config} />
      {/if}

      <button on:click={() => navigate("/registrations")} class="text">
        Cancel
      </button>
    {:else if state === State.NameUnavailable || state === State.CheckingFailed}
      <button on:click={() => navigate("/registrations")} class="">
        Back
      </button>
    {/if}
  </span>
</Modal>
