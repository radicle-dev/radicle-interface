<script lang="typescript">
  import { getRegistration } from './registrar';
  import type { Registration } from './registrar';
  import type { Config } from '@app/config';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Link from '@app/Link.svelte';
  import Modal from '@app/Modal.svelte';
  import Form from '@app/Form.svelte';
  import type { Field } from '@app/Form.svelte';

  export let subdomain: string;
  export let config: Config;

  let editable = false;
  let fields: Field[] = [];

  const loadRegistration = getRegistration(subdomain, config)
    .then(registration => {
      if (registration) {
        fields = [
          { label: "Address", type: "text", placeholder: "Not set",
            value: registration.address, editable: true },
          { label: "Owner", type: "text", placeholder: "",
            value: registration.owner, editable: false },
        ];
      }
      return registration;
    });

  const save = () => {};

  $: isOwner = (registration: Registration): boolean => {
    return registration.owner === ($session && $session.address);
  };
</script>

<style>
  main > header {
    display: flex;
    align-items: center;
    justify-content: left;
    margin-bottom: 2rem;
  }
  main > header > * {
    margin: 0 1rem 0 0;
  }
</style>

{#await loadRegistration}
  <Loading />
{:then registration}
  {#if registration}
    <main>
      <header>
        <h1 class="bold">{subdomain}.{config.registrar.domain}</h1>
        <button
          class="tiny primary" class:active={editable} disabled={!isOwner(registration)}
          on:click={() => editable = !editable}>
            Edit
        </button>
        <button class="tiny secondary" disabled={!isOwner(registration)}>
          Transfer
        </button>
      </header>
      <Form {editable} {fields} on:save={save} on:cancel={() => editable = false} />
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
