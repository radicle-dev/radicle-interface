<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import type { ethers } from "ethers";
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Link from '@app/Link.svelte';
  import Modal from '@app/Modal.svelte';
  import Form from '@app/Form.svelte';
  import type { Field } from '@app/Form.svelte';
  import { assert } from '@app/error';
  import Error from '@app/Error.svelte';
  import { isAddressEqual, isReverseRecordSet } from '@app/utils';

  import { getRegistration, getOwner } from './registrar';
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
    | { status: Status.Found; registration: Registration; owner: string }
    | { status: Status.Failed; error: string };

  export let subdomain: string;
  export let config: Config;

  subdomain = subdomain.toLowerCase();

  let state: State = { status: Status.Loading };
  let editable = false;
  let fields: Field[] = [];
  let name = `${subdomain}.${config.registrar.domain}`;
  let updateRecords: EnsRecord[] | null = null;
  let retries = 3;
  let resolver: ethers.providers.EnsResolver | undefined = undefined;

  async function parseRecords(r: Registration | null): Promise<Registration | null> {
    if (r) {
      let reverseRecord = false;
      if (r.profile.address) {
        reverseRecord = await isReverseRecordSet(r.profile.address, name, config);
      }
      const owner = await getOwner(name, config);
      resolver = r.resolver;

      fields = [
        { name: "owner", validate: "address", placeholder: "",
          description: "The owner and controller of this name.",
          value: owner, resolve: true, editable: false },
        { name: "address", validate: "address", placeholder: "Ethereum address, eg. 0x4a9cf21...bc91",
          description: "The address this name resolves to. " + (
            reverseRecord
              ? `The reverse record for this address is set to **${name}**`
              : "The reverse record for this address is **not set**. "
              + "For this name to be correctly associated with the address, "
              + "a reverse record should be set."
          ),
          value: r.profile.address, editable: true },
        { name: "url", label: "URL", validate: "url", placeholder: "https://acme.org",
          description: "A homepage or other URL associated with this name.",
          value: r.profile.url,editable: true },
        { name: "avatar", validate: "url", placeholder: "https://acme.org/avatar.png",
          description: "An avatar or square image associated with this name.",
          value: r.profile.avatar, editable: true },
        { name: "twitter", validate: "handle", placeholder: "Twitter username, eg. 'acme'",
          description: "The Twitter handle associated with this name.",
          value: r.profile.twitter, editable: true },
        { name: "github", validate: "handle", label: "GitHub", placeholder: "GitHub username, eg. 'acme'",
          description: "The GitHub username associated with this name.",
          value: r.profile.github, editable: true },
        { name: "seed.host", label: "Seed Host", validate: "domain", placeholder: "seed.acme.org",
          description: "The seed host address. " +
            "Only domain names with TLS are supported. " +
            `HTTP(S) API requests use port ${config.seed.api.port}.`,
          value: r.profile.seedHost, editable: true },
        { name: "seed.id", label: "Seed ID", validate: "id", placeholder: "hynkyndc6w3p8urucakobzncqny7xxtw88...",
          description: "The Device ID of a Radicle Link node that hosts entities associated with this name.",
          value: r.profile.seedId, editable: true },
      ];
      state = { status: Status.Found, registration: r, owner };
    } else {
      state = { status: Status.NotFound };
    }
    if (window.history.state?.retry) retries -= 1;
    return r;
  }

  onMount(() => {
    getRegistration(name, config, resolver)
      .then(parseRecords).catch(err => {
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

  $: if (window.history.state?.retry && state.status === Status.NotFound && retries > 0) {
    getRegistration(name, config, resolver).then(parseRecords).catch(err => {
      state = { status: Status.Failed, error: err };
    });
  }

  $: isOwner = (owner: string): boolean => {
    return $session ? isAddressEqual(owner, $session.address) : false;
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

<svelte:head>
  <title>{subdomain}.{config.registrar.domain}</title>
</svelte:head>

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
        class="tiny primary" class:active={editable} disabled={!isOwner(state.owner)}
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
