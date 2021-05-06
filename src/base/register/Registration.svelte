<script lang="typescript">
  import { getRegistration } from './registrar';
  import type { Registration } from './registrar';
  import type { Config } from '@app/config';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Link from '@app/Link.svelte';
  import Modal from '@app/Modal.svelte';

  export let subdomain: string;
  export let config: Config;

  $: isOwner = (registration: Registration): boolean => {
    return registration.owner === ($session && $session.address);
  };
</script>

<style>
  .fields {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 1.5rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
  }
</style>

{#await getRegistration(subdomain, config)}
  <Loading />
{:then registration}
  {#if registration}
    <main>
      <h1 class="bold">{subdomain}.{config.registrar.domain}</h1>
      <div class="fields">
        <!-- Address -->
        <div class="label">Address</div>
        <div>
          {#if registration.address}
            {registration.address}
          {:else}
            <span class="subtle">Not set</span>
          {/if}
        </div>
        <div>
          <button class="tiny primary" disabled={!isOwner(registration)}>
            Set
          </button>
        </div>
        <!-- Owner -->
        <div class="label">Owner</div>
        <div>{registration.owner}</div>
        <div>
          <button class="tiny secondary" disabled={!isOwner(registration)}>Transfer</button>
        </div>
      </div>
    </main>
  {:else}
    <Modal subtle>
      <span slot="title">
        {subdomain}.{config.registrar.domain}
      </span>

      <span slot="body">
        <p>The name <strong>{subdomain}</strong> is not registered.</p>
      </span>

      <span slot="actions">
        <Link to={`/register/${subdomain}`} primary>Register &rarr;</Link>
      </span>
    </Modal>
  {/if}
{/await}
