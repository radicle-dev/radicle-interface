<script lang="typescript">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { registerName, registrationFee } from '../registrar';
  import { State, state } from '../state';
  import type { Session } from '@app/session';
  import type { Config } from '@app/config';

  export let config: Config;
  export let subdomain: string;
  export let query: Record<string, any>;
  export let session: Session;

  let error: Error | null = null;
  let registrationOwner = query.get("owner") || session.address;

  async function getFee(cfg: Config) {
    let fee = await registrationFee(cfg);
    return ethers.utils.formatUnits(fee);
  }

  onMount(async () => {
    try {
      await registerName(subdomain, registrationOwner, config);
    } catch (e) {
      console.error("Error", e);

      state.set(State.Idle);
      error = e;
    }
  });
</script>

<style>
  .domain {
    color: var(--color-secondary);
  }
</style>

<div class="modal" class:error={error}>
  {#if error}
    <div class="modal-title error">
      Transaction failed
    </div>
  {:else}
    <div class="modal-title">
      {subdomain}.radicle.eth
    </div>
  {/if}

  {#if error}
    <div class="modal-body error">
      <strong>Error:</strong> {error.message}
    </div>
    <div class="modal-actions">
      <button on:click={() => navigate("/register")} class="error">
        Back
      </button>
    </div>
  {:else if $state === State.Approving}
    <div class="modal-body">
      Approving Registry for {#await getFee(config)}
        ?
      {:then fee}
        {fee}
      {/await} <strong>RAD</strong>...
    </div>
    <div class="modal-actions">
      <button disabled class="primary register">
        Approving...
      </button>
    </div>
  {:else if $state === State.Committing}
    <div class="modal-actions">
      <button disabled class="primary register">
        Committing...
      </button>
    </div>
  {:else if $state === State.WaitingToRegister}
    <div class="modal-body">
      <!-- TODO -->
    </div>
    <div class="modal-actions">
      <button disabled class="primary register">
        Waiting...
      </button>
    </div>
  {:else if $state === State.Registering}
    <div class="modal-actions">
      <button disabled class="primary register">
        Registering...
      </button>
    </div>
  {:else if $state === State.Registered}
    <div class="modal-body">
      The name <span class="domain">{subdomain}</span> has been successfully registered to {registrationOwner}.
    </div>
    <div class="modal-actions">
      <button on:click={() => state.set(State.Idle)} class="primary register">
        Done
      </button>
    </div>
  {/if}
</div>
