<script lang="typescript">
  // TODO: Should check for availability here, before saying a name is available.
  // Perhaps the availability check should be moved out of the 'submit' step then.
  import { navigate } from 'svelte-routing';
  import { formatAddress } from '@app/utils';
  import { registrar } from '../registrar';
  import { session } from '@app/session';
  import type { Config } from '@app/config';

  import Connect from '@app/Connect.svelte';
  import Modal from '@app/Modal.svelte';

  enum State {
    Initial,
    CheckingAvailability,
    NameUnavailable,
  }

  export let config: Config;
  export let subdomain: string;
  export let owner: string | null;

  let state = State.Initial;
  $: registrationOwner = owner || ($session && $session.address);

  async function begin() {
    state = State.CheckingAvailability;

    if (await registrar(config).available(subdomain)) {
      navigate(`/register/${subdomain}/submit?${
        registrationOwner ? new URLSearchParams({ owner: registrationOwner }) : ''
      }`);
    } else {
      state = State.NameUnavailable;
    }
  }
</script>

<style>
</style>

<Modal>
  <span slot="title">
    {subdomain}.{config.registrar.domain}
  </span>

  <span slot="body">
    {#if state === State.Initial || state === State.CheckingAvailability}
      {#if registrationOwner}
        The name <span class="highlight">{subdomain}</span> is available for registration
        under account <span class="highlight">{formatAddress(registrationOwner)}</span>.
      {:else}
        The name <span class="highlight">{subdomain}</span> is available for registration.
      {/if}
    {:else if state === State.NameUnavailable}
      The name <span class="highlight">{subdomain}</span> is not available for registration.
    {/if}
  </span>

  <span slot="actions">
    {#if state === State.CheckingAvailability}
      <button disabled class="primary register">
        Checking availability...
      </button>
    {:else if state === State.NameUnavailable}
      <button on:click={() => navigate("/register")} class="">
        Back
      </button>
    {:else}
      {#if $session}
        <button on:click={begin} class="primary register">
          Begin registration &rarr;
        </button>
      {:else}
        <Connect caption="Connect to register" className="primary" {config} />
      {/if}

      <button on:click={() => navigate("/register")} class="text">
        Cancel
      </button>
    {/if}
  </span>
</Modal>
