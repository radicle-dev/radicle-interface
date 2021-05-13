<script lang="typescript">
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import type { SvelteComponent } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/register/registrar';
  import { getRegistration } from '@app/base/register/registrar';
  import { parseEnsLabel } from '@app/utils';
  import { Org } from './Org';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Error from '@app/Error.svelte';
  import Icon from '@app/Icon.svelte';
  import SetName from '@app/ens/SetName.svelte';

  export let address: string;
  export let config: Config;

  let registration: Registration | null = null;
  let name: string | null = null;

  const back = () => navigate("/orgs");

  onMount(async () => {
    name = await config.provider.lookupAddress(address);
    registration = await getRegistration(name, config);
  });

  let setNameForm: typeof SvelteComponent | null = null;
  const setName = () => {
    setNameForm = SetName;
  };

  $: label = name && parseEnsLabel(name, config);
  $: isOwner = (org: Org): boolean => {
    return org.safe === ($session && $session.address);
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
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;
  }
  .fields {
    display: grid;
    grid-template-columns: 1fr 8fr;
    grid-gap: 1rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
    height: 2rem;
    line-height: 2rem;
  }
  .avatar {
    width: 64px;
    height: 64px;
  }
  .links {
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .url {
    display: flex; /* Ensures correct vertical positioning of icons */
    margin-right: 1rem;
  }
</style>

{#await Org.get(address, config)}
  <Loading />
{:then org}
  {#if org}
    <main>
      <header>
        {#if registration && registration.avatar}
          <div class="avatar">
            <img src={registration.avatar} alt="avatar" />
          </div>
        {/if}
        <div class="info">
          <span class="title bold">{label || address}</span>
          <div class="links">
            {#if registration}
              {#if registration.url}
                <a class="url" href={registration.url}>{registration.url}</a>
              {/if}
              {#if registration.twitter}
                <a class="url" href={registration.twitter}>
                  <Icon name="twitter" />
                </a>
              {/if}
              {#if registration.github}
                <a class="url" href={registration.github}>
                  <Icon name="github" />
                </a>
              {/if}
            {/if}
          </div>
        </div>
      </header>

      <div class="fields">
        <div class="label">Address</div><div>{org.address}</div>
        <div class="label">Owner</div><div>{org.safe}</div>
        <div class="label">Name</div>
        <div>
          {#await org.lookupAddress(config)}
            <Loading small />
          {:then name}
            {#if name}
              <Link to={`/registrations/${label}`}>{name}</Link>
            {:else if isOwner(org)}
              <button class="tiny primary" on:click={setName}>
                Set
              </button>
            {:else}
              <span class="subtle">Not set</span>
            {/if}
          {/await}
        </div>
      </div>
    </main>
  {:else}
    <Modal subtle>
      <span slot="title">🏜️</span>
      <span slot="body">Sorry, <span class="highlight">{address}</span> does not resolve to an Org address.</span>
      <span slot="actions">
        <button on:click={back}>
          Back
        </button>
      </span>
    </Modal>
  {/if}
  <svelte:component this={setNameForm} {org} {config} on:close={() => setNameForm = null} />
{:catch err}
  <Error error={err} />
{/await}
