<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import Link from '@app/Link.svelte';
  import type { Config } from '@app/config';
  import { parseEnsLabel, explorerLink } from '@app/utils';
  import { session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Error from '@app/Error.svelte';
  import Icon from '@app/Icon.svelte';
  import SetName from '@app/ens/SetName.svelte';
  import Project from '@app/base/projects/Widget.svelte';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';
  import Message from '@app/Message.svelte';
  import * as utils from '@app/utils';

  import { Org } from '@app/base/orgs/Org';
  import TransferOwnership from '@app/base/orgs/TransferOwnership.svelte';
  import { Profile } from '@app/profile';

  export let address: string;
  export let config: Config;

  const back = () => window.history.back();

  let setNameForm: typeof SvelteComponent | null = null;
  const setName = () => {
    setNameForm = SetName;
  };

  let transferOwnerForm: typeof SvelteComponent | null = null;
  const transferOwnership = () => {
    transferOwnerForm = TransferOwnership;
  };
  $: isOwner = (org: Org): boolean => $session
    ? utils.isAddressEqual(org.owner, $session.address)
    : false;
  $: isAuthorized = async (org: Org): Promise<boolean> => {
    if ($session) {
      if (isOwner(org)) {
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
    width: 54rem;
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
  .links {
    height: 1.5rem;
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
    align-items: center;
    display: flex;
  }
  .members .member {
    display: flex;
    align-items: center;
    margin-right: 2rem;
  }
  .members .member:last-child {
    margin-right: 0;
  }
  .members .member-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
  }
</style>

{#await Org.get(address, config)}
  <main class="centered">
    <Loading center />
  </main>
{:then org}
  {#if org}
    <main>
      {#await Profile.get(address, config)}
        <div class="centered">
          <Loading center />
        </div>
      {:then profile}
        <header>
          <div class="avatar">
            <Avatar source={profile.avatar ?? address} />
          </div>
          <div class="info">
            <span class="title bold">
              {parseEnsLabel(profile.name, config) ?? address}
            </span>
            <div class="links">
              {#if profile.url}
                <a class="url" href={profile.url}>
                  {profile.url}
                </a>
              {/if}
              {#if profile.twitter}
                <a class="url" href="https://twitter.com/{profile.twitter}">
                  <Icon name="twitter" />
                </a>
              {/if}
              {#if profile.github}
                <a class="url" href="https://github.com/{profile.github}">
                  <Icon name="github" />
                </a>
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
            {#if isOwner(org)}
              <button class="tiny secondary" on:click={transferOwnership}>
                Transfer
              </button>
            {/if}
          </div>
          <!-- Name -->
          <div class="label">Name</div>
          <div>
            {#if profile.name}
              <Link to={`/registrations/${parseEnsLabel(profile.name, config)}`}>{profile.name}</Link>
            {:else}
              <span class="subtle">Not set</span>
            {/if}
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

        {#await org.getMembers(config)}
          <Loading center />
        {:then members}
          {#if members.length > 0}
            <div class="members">
              {#each members as address}
                {#await Profile.get(address, config)}
                  <Loading small center />
                {:then profile}
                  <div class="member">
                    <div class="member-icon">
                      <Avatar source={profile.avatar ?? address} />
                    </div>
                    <Address {address} compact resolve noAvatar {config} />
                  </div>
                {/await}
              {/each}
            </div>
          {/if}
        {/await}

        <div class="projects">
          {#await org.getProjects(config)}
            <Loading center />
          {:then projects}
            {#each projects as project}
              <div class="project">
                <Project {project} org={org.address} {config} seed={profile.seed} />
              </div>
            {/each}
          {:catch err}
            <Message error>
              <strong>Error: </strong> failed to load projects: {err.message}.
            </Message>
          {/await}
        </div>
      {/await}
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
