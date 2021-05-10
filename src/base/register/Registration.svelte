<script lang="typescript">
  import { getRegistration } from './registrar';
  import { setRecords } from './resolver';
  import type { EnsRecord } from './resolver';
  import type { Registration } from './registrar';
  import type { Config } from '@app/config';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Link from '@app/Link.svelte';
  import Modal from '@app/Modal.svelte';
  import Form from '@app/Form.svelte';
  import type { Field } from '@app/Form.svelte';
  import { assert } from '@app/error';

  export let subdomain: string;
  export let config: Config;

  let editable = false;
  let fields: Field[] = [];
  let registration: Registration | null = null;

  const loadRegistration = getRegistration(subdomain, config)
    .then(r => {
      if (r) {
        fields = [
          { name: "owner", placeholder: "",
            value: r.owner, editable: false },
          { name: "address", placeholder: "Not set",
            value: r.address, editable: true },
          { name: "url", label: "URL", placeholder: "Not set",
            value: r.url, editable: true },
          { name: "avatar", placeholder: "Not set",
            value: r.avatar, editable: true },
          { name: "twitter", placeholder: "Not set",
            value: r.twitter, editable: true },
          { name: "github", placeholder: "Not set",
            value: r.github, editable: true },
        ];
        registration = r;
      }
      return r;
    });

  const save = async (event: { detail: Field[] }) => {
    assert(registration, "registration was found");

    const recs: EnsRecord[] = event.detail
      .filter(r => r.editable && r.value !== null)
      .map(f => {
        assert(f.value !== null);
        return { name: f.name, value: f.value }
      });

    const tx = await setRecords(subdomain, recs, registration.resolver, config);
    // TODO: Disable button and fields
    await tx.wait();
    // TODO: Reload registration
  };

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
