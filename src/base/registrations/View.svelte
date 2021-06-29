<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Link from '@app/Link.svelte';
  import Modal from '@app/Modal.svelte';
  import Form from '@app/Form.svelte';
  import type { Field } from '@app/Form.svelte';
  import { assert } from '@app/error';
  import Error from '@app/Error.svelte';
  import { isAddressEqual } from '@app/utils';

  import { getRegistration } from './registrar';
  import type { EnsRecord } from './resolver';
  import type { Registration } from './registrar';
  import Update from './Update.svelte';

  enum Status {
    Loading,
    Found,
    NotFound,
    Failed,
  }

  type State =
      { status: Status.Loading }
    | { status: Status.NotFound }
    | { status: Status.Found; registration: Registration }
    | { status: Status.Failed; error: string };

  export let subdomain: string;
  export let config: Config;

  let state: State = { status: Status.Loading };
  let editable = false;
  let fields: Field[] = [];
  let name = `${subdomain}.${config.registrar.domain}`;
  let updateRecords: EnsRecord[] | null = null;

  onMount(() => {
    getRegistration(name, config)
      .then(r => {
        if (r) {
          fields = [
            { name: "owner", placeholder: "",
              value: r.owner, resolve: true, editable: false },
            { name: "address", placeholder: "Not set",
              value: r.address, resolve: false, editable: true },
            { name: "seed", placeholder: "Not set",
              value: r.seed, resolve: false, editable: true },
            { name: "url", label: "URL", placeholder: "Not set",
              value: r.url, resolve: false, editable: true },
            { name: "avatar", placeholder: "Not set",
              value: r.avatar, resolve: false, editable: true },
            { name: "twitter", placeholder: "Not set",
              value: r.twitter, resolve: false, editable: true },
            { name: "github", placeholder: "Not set",
              value: r.github, resolve: false, editable: true },
          ];
          state = { status: Status.Found, registration: r };
        } else {
          state = { status: Status.NotFound };
        }
        return r;
      }).catch(err => {
        state = { status: Status.Failed, error: err };
      });
  });

  const onSave = async (event: { detail: { name: string; value: string | null }[] }) => {
    assert(state.status === Status.Found, "registration must be found");

    updateRecords = event.detail
      .filter(f => f.value !== null)
      .map(f => {
        return { name: f.name, value: f.value as string };
      });
  };

  $: isOwner = (registration: Registration): boolean => {
    return $session ? isAddressEqual(registration.owner, $session.address) : false;
  };
</script>

<style>
  main {
    padding: 5rem 0;
  }
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

{#if state.status === Status.Loading}
  <Loading />
{:else if state.status === Status.Failed}
  <Error title="Registration could not be loaded" on:close={() => navigate('/registrations')}>
    {state.error}
  </Error>
{:else if state.status === Status.NotFound}
  <Modal subtle>
    <span slot="title" class="secondary">
      <div>🍄</div>
      {subdomain}.{config.registrar.domain}
    </span>

    <span slot="body">
      <p>The name <strong>{subdomain}</strong> is not registered.</p>
    </span>

    <span slot="actions">
      <Link to={`/registrations/${subdomain}/form`} primary>Register &rarr;</Link>
    </span>
  </Modal>
{:else if state.status === Status.Found}
  <main>
    <header>
      <h1 class="bold">{subdomain}.{config.registrar.domain}</h1>
      <button
        class="tiny primary" class:active={editable} disabled={!isOwner(state.registration)}
        on:click={() => editable = !editable}>
          Edit
      </button>
      <button class="tiny secondary" disabled>
        Transfer
      </button>
    </header>
    <Form {config} {editable} {fields} on:save={onSave} on:cancel={() => editable = false} />
  </main>

  {#if updateRecords}
    <Update {config} {subdomain} on:close={() => updateRecords = null}
            registration={state.registration} records={updateRecords} />
  {/if}
{/if}
