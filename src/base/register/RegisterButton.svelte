<script lang="javascript">
  import { get } from 'svelte/store';
  import { error } from '@app/error.js';
  import { session } from '@app/session.js';
  import { STATE, state } from './state.js';
  import { registrar, registerName } from './registrar.js';

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
        state.set(STATE.NAME_AVAILABLE);
      } else {
        state.set(STATE.NAME_UNAVAILABLE);
      }
    });
    state.set(STATE.CHECKING_AVAILABILITY);
  }

  function cancel() {
    state.set(STATE.IDLE);
    error.set(null);
  }
</script>

<style>
  .cancel {
    margin-left: 1rem;
  }
</style>

{#if $state >= STATE.NAME_AVAILABLE && $state < STATE.REGISTERED}
  {#if $session.address}
    <button on:click={register} disabled={$state > STATE.NAME_AVAILABLE} class="primary register">
      {#if $state === STATE.APPROVING}
        Approving...
      {:else if $state === STATE.COMMITTING}
        Committing...
      {:else if $state === STATE.WAITING_TO_REGISTER}
        Waiting...
      {:else if $state === STATE.REGISTERING}
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
{:else if $state === STATE.REGISTERED}
  <button on:click={() => state.set(STATE.IDLE)}>
    Done
  </button>
{:else if $state === STATE.NAME_UNAVAILABLE}
  <button on:click={() => state.set(STATE.IDLE)}>
    Back
  </button>
{:else if subdomain == ""}
  <button disabled class="primary register">
    Check
  </button>
{:else if $state === STATE.CHECKING_AVAILABILITY}
  <button disabled class="primary register" data-waiting>
    Check
  </button>
{:else}
  <button on:click={checkAvailability} class="primary register">
    Check
  </button>
{/if}
