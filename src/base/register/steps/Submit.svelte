<script lang="typescript">
  // TODO: When name is registered, prompt user to edit records.
  // TODO: When transfering name, warn about transfering to org.
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { registerName, registrationFee } from '../registrar';
  import { State, state } from '../state';
  import type { Session } from '@app/session';
  import type { Config } from '@app/config';
  import Loading from '@app/Loading.svelte';

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

<style></style>

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
      <Loading small center />
    </div>
  {:else if $state === State.Committing}
    <div class="modal-body">
      Committing...
    </div>
    <div class="modal-actions">
      <Loading small center />
    </div>
  {:else if $state === State.WaitingToRegister}
    <div class="modal-body">
      Waiting for commitment time...
    </div>
    <div class="modal-actions">
      <Loading small center />
    </div>
  {:else if $state === State.Registering}
    <div class="modal-body">
      Registering name...
    </div>
    <div class="modal-actions">
      <Loading small center />
    </div>
  {:else if $state === State.Registered}
    <div class="modal-body">
      The name <strong>{subdomain}</strong> has been successfully registered to
      <strong>{registrationOwner}</strong>.
    </div>
    <div class="modal-actions">
      <button on:click={() => state.set(State.Idle)} class="primary register">
        Done
      </button>
    </div>
  {/if}
</div>
