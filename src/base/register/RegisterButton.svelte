<script lang="typescript">
  import { get } from 'svelte/store';
  import { error } from '@app/error';
  import { session } from '@app/session';
  import { State, state } from './state';
  import { registrar, registerName } from './registrar';

  import Connect from '@app/Connect.svelte';

  export let subdomain;
  export let config;

  async function register() {
    let sess = get(session);
    let oldState = get(state);

    try {
      await registerName(subdomain, sess.address, config);
    } catch (e) {
      console.error(e);

      state.set(oldState);
      error.set(e);
    }
  }

  async function checkAvailability() {
    registrar(config).available(subdomain).then(isAvailable => {
      if (isAvailable) {
        state.set(State.NameAvailable);
      } else {
        state.set(State.NameUnavailable);
      }
    });
    state.set(State.CheckingAvailability);
  }

  function cancel() {
    state.set(State.Idle);
    error.set(null);
  }
</script>

<style>
  .cancel {
    margin-left: 1rem;
  }
</style>

{#if $state >= State.NameAvailable && $state < State.Registered}
  {#if $session.address}
    <button on:click={register} disabled={$state > State.NameAvailable} class="primary register">
      {#if $state === State.Approving}
        Approving...
      {:else if $state === State.Committing}
        Committing...
      {:else if $state === State.WaitingToRegister}
        Waiting...
      {:else if $state === State.Registering}
        Registering...
      {:else}
        Begin registration &rarr;
      {/if}
    </button>
  {:else}
    <Connect caption="Connect to register" className="primary" />
  {/if}
  <button on:click={cancel} class="cancel text">
    Cancel
  </button>
{:else if $state === State.Registered}
  <button on:click={() => state.set(State.Idle)}>
    Done
  </button>
{:else if $state === State.NameUnavailable}
  <button on:click={() => state.set(State.Idle)}>
    Back
  </button>
{:else if subdomain == ""}
  <button disabled class="primary register">
    Check
  </button>
{:else if $state === State.CheckingAvailability}
  <button disabled class="primary register" data-waiting>
    Check
  </button>
{:else}
  <button on:click={checkAvailability} class="primary register">
    Check
  </button>
{/if}
