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
  import Modal from '@app/Modal.svelte';
  import Err from '@app/Error.svelte';

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

  const done = () => navigate(`/registrations/${subdomain}`)

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

{#if error}
  <Err
    title="Transaction failed"
    message={error.message}
    on:close={() => navigate('/register')}
  />
{:else}
  <Modal>
    <span slot="title">
      {subdomain}.{config.registrar.domain}
    </span>

    <span slot="body">
      {#if $state === State.Approving}
        Approving Registry for {#await getFee(config)}
          ?
        {:then fee}
          {fee}
        {/await} <strong>RAD</strong>...
      {:else if $state === State.Committing}
        Committing...
      {:else if $state === State.WaitingToRegister}
        Waiting for commitment time...
      {:else if $state === State.Registering}
        Registering name...
      {:else if $state === State.Registered}
        The name <strong>{subdomain}</strong> has been successfully registered to
        <strong>{registrationOwner}</strong>.
      {/if}
    </span>

    <span slot="actions">
      {#if $state === State.Registered}
        <button on:click={done} class="primary register">
          Done
        </button>
      {:else}
        <div class="modal-actions">
          <Loading small center />
        </div>
      {/if}
    </span>
  </Modal>
{/if}
