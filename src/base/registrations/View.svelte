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

  export let domain: string;
  export let config: Config;

  domain = domain.toLowerCase();

  let state: State = { status: Status.Loading };
  let editable = false;
  let fields: Field[] = [];
  let updateRecords: EnsRecord[] | null = null;
  let retries = 3;
  let resolver: ethers.providers.EnsResolver | undefined = undefined;

  async function parseRecords(r: Registration | null): Promise<Registration | null> {
    if (r) {
      let reverseRecord = false;
      if (r.profile.address) {
        reverseRecord = await isReverseRecordSet(r.profile.address, domain, config);
      }
      const owner = await getOwner(domain, config);
      resolver = r.resolver;

      fields = [
        { name: "owner", validate: "address", placeholder: "",
          description: "The owner and controller of this name.",
          value: owner, resolve: true, editable: false },
        { name: "address", validate: "address", placeholder: "Ethereum address, eg. 0x4a9cf21...bc91",
          description: "The address this name resolves to. " + (
            reverseRecord
              ? `The reverse record for this address is set to **${domain}**`
              : "The reverse record for this address is **not set**. "
              + "For this name to be correctly associated with the address, "
              + "a reverse record should be set."
          ),
          value: r.profile.address, editable: true },
        { name: "url", label: "URL", validate: "URL", placeholder: "https://acme.org",
          description: "A homepage or other URL associated with this name.",
          value: r.profile.url,editable: true },
        { name: "avatar", validate: "URL", placeholder: "https://acme.org/avatar.png",
          description: "An avatar or square image associated with this name.",
          value: r.profile.avatar, editable: true },
        { name: "twitter", validate: "handle", placeholder: "Twitter username, eg. 'acme'",
          description: "The Twitter handle associated with this name.",
          value: r.profile.twitter, editable: true },
        { name: "github", validate: "handle", label: "GitHub", placeholder: "GitHub username, eg. 'acme'",
          description: "The GitHub username associated with this name.",
          value: r.profile.github, editable: true },
        { name: "seed.host", label: "Seed Host", validate: "domain", placeholder: "seed.acme.org",
          url: r.profile.seed && `/seeds/${r.profile.seed.host}`,
          description: "The seed host address. " +
            "Only domain names with TLS are supported. " +
            `HTTP(S) API requests use port ${config.seed.api.port}.`,
          value: r.profile.seed?.host, editable: true },
        { name: "seed.id", label: "Seed ID", validate: "id", placeholder: "hynkyndc6w3p8urucakobzncqny7xxtw88...",
          description: "The Device ID of a Radicle Link node that hosts entities associated with this name.",
          value: r.profile.seed?.id, editable: true },
        { name: "anchors", label: "Anchors", validate: "URN", placeholder: "URN, eg. eip155:1:0x4a9cf21...",
          description: "URN under which associated project anchors can be found. "
            + "To point to a Radicle org on Ethereum, use the CAIP-10 ID, eg. *eip155:1:0x4a9cf21...*",
          value: r.profile.anchorsAccount, editable: true },
      ];
      state = { status: Status.Found, registration: r, owner };
    } else {
      state = { status: Status.NotFound };
    }
    if (window.history.state?.retry) retries -= 1;
    return r;
  }

  onMount(() => {
    getRegistration(domain, config, resolver)
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
    getRegistration(domain, config, resolver).then(parseRecords).catch(err => {
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
  @media (max-width: 720px) {
    main {
      width: 100%;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
</style>

<svelte:head>
  <title>{domain}</title>
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
      {domain}
    </span>

    <span slot="body">
      <p>The name <strong>{domain}</strong> is not registered.</p>
    </span>

    <span slot="actions">
      <Link to={`/registrations/${domain}/form`} primary>Register &rarr;</Link>
    </span>
  </Modal>
{:else if state.status === Status.Found}
  <main>
    <header>
      <h1 class="bold">{domain}</h1>
      <button
        style="min-width: 60px;"
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
    <Update {config} {domain} on:close={() => updateRecords = null}
            registration={state.registration} records={updateRecords} />
  {/if}
{/if}
