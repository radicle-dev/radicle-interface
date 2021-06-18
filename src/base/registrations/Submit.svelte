<script lang="ts">
  // TODO: When name is registered, prompt user to edit records.
  // TODO: When transfering name, warn about transfering to org.
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Session } from '@app/session';
  import type { Config } from '@app/config';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Err from '@app/Error.svelte';

  import { registerName, State, state } from './registrar';

  export let config: Config;
  export let subdomain: string;
  export let owner: string | null;
  export let session: Session;

  let error: Error | null = null;
  let registrationOwner = owner || session.address;

  const view = () => navigate(`/registrations/${subdomain}`);

  onMount(async () => {
    try {
      await registerName(subdomain, registrationOwner, config);
    } catch (e) {
      console.error("Error", e);

      state.set(State.Failed);
      error = e;
    }
  });
</script>

<style></style>

{#if error}
  <Err
    title="Transaction failed"
    message={error.message}
    on:close={() => navigate('/registrations')}
  />
{:else}
  <Modal>
    <span slot="title">
      {#if $state === State.Registered}
        <div>🎉</div>
      {/if}
      {subdomain}.{config.registrar.domain}
    </span>

    <span slot="subtitle">
      {#if $state === State.Connecting}
        Connecting...
      {:else if $state === State.Committing}
        Committing...
      {:else if $state === State.WaitingToRegister}
        Waiting for commitment time...
      {:else if $state === State.Registering}
        Registering name...
      {/if}
    </span>

    <span slot="body">
      {#if $state === State.Registered}
        The name has been successfully registered to
        <span class="highlight">{registrationOwner}</span>.
      {:else}
        <Loading small center />
      {/if}
    </span>

    <span slot="actions">
      {#if $state === State.Registered}
        <button on:click={view} class="register">
          View
        </button>
      {/if}
    </span>
  </Modal>
{/if}
