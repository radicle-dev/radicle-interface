<script lang="typescript">
  import { navigate } from 'svelte-routing';
  import { error } from '@app/error';
  import { formatAddress } from '@app/utils';
  import { registrar } from '../registrar';
  import { session } from '@app/session';

  import Connect from '@app/Connect.svelte';

  enum State {
    Initial,
    CheckingAvailability,
    NameUnavailable,
  }

  export let config;
  export let subdomain;
  export let query;

  let state = State.Initial;
  $: registrationOwner = query.get("owner") || ($session && $session.address);

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

<div class="modal">
  <div class="modal-title">
    {subdomain}.radicle.eth
  </div>

  <div class="modal-body">
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
  </div>

  <div class="modal-actions">
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
  </div>
</div>
