<script lang="ts">
  import * as ethers from 'ethers';
  import { onMount } from 'svelte';
  import type { SvelteComponent } from 'svelte';
  import Link from '@app/Link.svelte';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/registrations/registrar';
  import { getRegistration } from '@app/base/registrations/registrar';
  import { parseEnsLabel, explorerLink } from '@app/utils';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Error from '@app/Error.svelte';
  import Icon from '@app/Icon.svelte';
  import Blockies from '@app/Blockies.svelte';
  import SetName from '@app/ens/SetName.svelte';
  import Project from '@app/base/projects/Widget.svelte';
  import Address from '@app/Address.svelte';
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
  $: isAuthorized = async (org: Org): Promise<boolean> => {
    if ($session) {
      if (utils.isAddressEqual(org.owner, $session.address)) {
        return true;
      }
      return await org.isMember($session.address, config);
    }
    return false;
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
    grid-template-columns: 5rem 4fr 2fr;
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
  .avatar img {
    width: 100%;
    height: 100%;
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
  .projects .project {
    margin-bottom: 1rem;
  }
  .members {
    margin-top: 2rem;
    display: flex;
  }
  .members .member {
    display: flex;
    align-items: center;
    margin-right: 1.5rem;
  }
  .members .member a {
    border-bottom: none;
  }
  .members .member-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
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
            <Blockies address={org.address} />
          {/if}
        </div>
        <div class="info">
          <span class="title bold">
            {registration ? label : ethers.utils.getAddress(address)}
          </span>
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
        <div class="label">Address</div>
        <div><Address {config} address={org.address} /></div>
        <div></div>
        <!-- Owner -->
        <div class="label">Owner</div>
        <div><Address resolve {config} address={org.owner} /></div>
        <div>
          {#await isAuthorized(org)}
            <!-- Loading -->
          {:then authorized}
            {#if authorized}
              <button class="tiny secondary" on:click={transferOwnership}>
                Transfer
              </button>
            {/if}
          {/await}
        </div>
        <!-- Name -->
        <div class="label">Name</div>
        <div>
          {#await org.lookupAddress(config)}
            <div class="loading"><Loading small /></div>
          {:then name}
            {#if name}
              <Link to={`/registrations/${label}`}>{name}</Link>
            {:else}
              <span class="subtle">Not set</span>
            {/if}
          {/await}
        </div>
        <div>
          {#await isAuthorized(org)}
            <!-- Loading -->
          {:then authorized}
            {#if authorized}
              <button class="tiny secondary" on:click={setName}>
                Set
              </button>
            {/if}
          {/await}
        </div>
      </div>

      <div class="members">
        {#await org.getMembers(config)}
          <Loading center />
        {:then members}
          {#each members as address}
            <div class="member">
              <div class="member-icon">
                <Blockies {address} />
              </div>
              <a href={explorerLink(address, config)} target="_blank" class="member">
                {utils.formatAddress(address)}
              </a>
            </div>
          {/each}
        {/await}
      </div>

      <div class="projects">
        {#await org.getProjects(config)}
          <Loading center />
        {:then projects}
          {#each projects as project}
            <div class="project">
              <Project {project} org={org.address} {config} />
            </div>
          {/each}
        {:catch err}
          <div class="error error-message">
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
            <a href={explorerLink(address, config)} class="link" target="_blank">View in explorer</a>
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
