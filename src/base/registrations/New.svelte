<script lang="typescript">
  // TODO: Should check for availability here, before saying a name is available.
  // Perhaps the availability check should be moved out of the 'submit' step then.
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { formatAddress } from '@app/utils';
  import { session } from '@app/session';
  import type { Config } from '@app/config';

  import Connect from '@app/Connect.svelte';
  import Modal from '@app/Modal.svelte';
  import Loading from '@app/Loading.svelte';

  import { registrar } from './registrar';

  enum State {
    CheckingAvailability,
    NameAvailable,
    NameUnavailable,
  }

  export let config: Config;
  export let subdomain: string;
  export let owner: string | null;

  let state = State.CheckingAvailability;
  $: registrationOwner = owner || ($session && $session.address);

  function begin() {
    navigate(`/registrations/${subdomain}/submit?${
      registrationOwner ? new URLSearchParams({ owner: registrationOwner }) : ''
    }`);
  }

  onMount(async () => {
    if (await registrar(config).available(subdomain)) {
      state = State.NameAvailable;
    } else {
      state = State.NameUnavailable;
    }
  });
</script>

<Modal>
  <span slot="title">
    {subdomain}.{config.registrar.domain}
  </span>

  <span slot="body">
    {#if state === State.NameAvailable}
      {#if registrationOwner}
        The name <span class="highlight">{subdomain}</span> is available for registration
        under account <span class="highlight">{formatAddress(registrationOwner)}</span>.
      {:else}
        The name <span class="highlight">{subdomain}</span> is available for registration.
      {/if}
    {:else if state === State.NameUnavailable}
      The name <span class="highlight">{subdomain}</span> is not available for registration.
    {:else if state === State.CheckingAvailability}
      <Loading small center />
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
    {:else if state === State.NameUnavailable}
      <button on:click={() => navigate("/registrations")} class="">
        Back
      </button>
    {/if}
  </span>
</Modal>
