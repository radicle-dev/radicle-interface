<script lang="typescript">
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import type { SvelteComponent } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/registrations/registrar';
  import { getRegistration } from '@app/base/registrations/registrar';
  import { parseEnsLabel, explorerLink } from '@app/utils';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Error from '@app/Error.svelte';
  import Icon from '@app/Icon.svelte';
  import Blocky from '@app/Blocky.svelte';
  import SetName from '@app/ens/SetName.svelte';
  import Project from '@app/base/projects/Widget.svelte';
  import * as utils from '@app/utils';

  import { Org } from './Org';
  import TransferOwnership from './TransferOwnership.svelte';

  export let address: string;
  export let config: Config;

  let registration: Registration | null = null;
  let name: string | null = null;

  const back = () => window.history.back();

  onMount(async () => {
    name = await config.provider.lookupAddress(address);
    if (name) registration = await getRegistration(name, config);
  });

  let setNameForm: typeof SvelteComponent | null = null;
  const setName = () => {
    setNameForm = SetName;
  };

  let transferOwnerForm: typeof SvelteComponent | null = null;
  const transferOwnership = () => {
    transferOwnerForm = TransferOwnership;
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
  .info a {
    border: none;
  }
  .fields {
    display: grid;
    grid-template-columns: 1fr 4fr 2fr;
    grid-gap: 1rem 2rem;
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
  .projects {
    margin-top: 2rem;
  }
</style>

{#await Org.get(address, config)}
  <Loading fadeIn />
{:then org}
  {#if org}
    <main>
      <header>
        <div class="avatar">
          {#if registration && registration.avatar}
            <img src={registration.avatar} alt="avatar" />
          {:else}
            <Blocky address={org.address} />
          {/if}
        </div>
        <div class="info">
          <span class="title bold">{registration ? label : address}</span>
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
        <!-- Address -->
        <div class="label">Address</div><div>{org.address}</div><div></div>
        <!-- Owner -->
        <div class="label">Owner</div><div>{org.safe}</div>
        <div>
          {#if isOwner(org)}
            <button class="tiny secondary" on:click={transferOwnership}>
              Transfer
            </button>
          {/if}
        </div>
        <!-- Name -->
        <div class="label">Name</div>
        <div>
          {#await org.lookupAddress(config)}
            <Loading small />
          {:then name}
            {#if name}
              <Link to={`/registrations/${label}`}>{name}</Link>
            {:else}
              <span class="subtle">Not set</span>
            {/if}
          {/await}
        </div>
        <div>
          {#if isOwner(org)}
            <button class="tiny secondary" on:click={setName}>
              Set
            </button>
          {/if}
        </div>
      </div>

      <div class="projects">
        {#await org.getProjects(config)}
          <Loading center />
        {:then projects}
          {#each projects as project}
            <Project {project} {config} />
          {/each}
        {:catch err}
          <div class="error">
            Error loading projects: {err}.
          </div>
        {/await}
      </div>
    </main>
  {:else}
    <Modal subtle>
      <span slot="title">🏜️</span>
      <span slot="body">
        <p class="highlight"><strong>{address}</strong></p>
        <p>Sorry, there is no Org at this address.</p>
        {#if utils.isAddress(address)}
          <p>
            <a href={explorerLink(address, config)} target="_blank">View in explorer</a>
            <span class="faded">↗</span>
          </p>
        {/if}
      </span>
      <span slot="actions">
        <button on:click={back}>
          Back
        </button>
      </span>
    </Modal>
  {/if}
  <svelte:component this={setNameForm} {org} {config} on:close={() => setNameForm = null} />
  <svelte:component this={transferOwnerForm} {org} {config} on:close={() => transferOwnerForm = null} />
{:catch err}
  <Error error={err} />
{/await}
