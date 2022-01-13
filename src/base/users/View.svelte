<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import type { Config } from '@app/config';
  import Icon from '@app/Icon.svelte';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { ProfileType, Profile } from '@app/profile';
  import Loading from '@app/Loading.svelte';
  import { Org } from '@app/base/orgs/Org';
  import Message from '@app/Message.svelte';
  import Project from '@app/base/projects/Widget.svelte';
  import { session } from '@app/session';
  import { formatCommit, isAddressEqual } from '@app/utils';
  import Error from '@app/Error.svelte';
  import SetName from '@app/ens/SetName.svelte';
  import { User } from '@app/base/users/User';
  import Link from '@app/Link.svelte';
  import SeedAddress from '@app/SeedAddress.svelte';

  export let addressOrName: string;
  export let config: Config;
  export let action: string | null = null;

  let setNameForm: typeof SvelteComponent | null =
    action === "setName" ? SetName : null;
  const setName = () => {
    setNameForm = SetName;
  };

  $: isAuthorized = (address: string): boolean | null => {
    return $session && isAddressEqual(address, $session.address);
  };
</script>

<style>
  main {
    padding: 5rem 0;
    width: 720px;
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
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .url {
    display: flex; /* Ensures correct vertical positioning of icons */
    margin-right: 1rem;
  }
  .url {
    height: 1.6rem; /* Height of the icon */
  }
  .projects {
    margin-top: 1rem;
  }
  .projects .project {
    margin-bottom: 1rem;
  }
  .members {
    margin-top: 2rem;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }
  .members .member {
    display: flex;
    align-items: center;
    margin-right: 2rem;
    margin-bottom: 1rem;
  }
  .members .member:last-child {
    margin-right: 0;
  }
  .members .member-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
  }

  @media (max-width: 720px) {
    .fields {
      grid-template-columns: 5rem auto;
    }
    main {
      width: 100%;
      padding: 1.5rem;
    }
    .members .member {
      margin-right: 1rem;
    }
  }
</style>

<svelte:head>
  <title>{addressOrName}</title>
</svelte:head>

{#await Profile.get(addressOrName, ProfileType.Full, config)}
  <Loading fadeIn />
{:then profile}
  <main>
    <header>
      <div class="avatar">
        <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
      </div>
      <div class="info">
        <span class="title bold">
          <Address compact noAvatar noBadge {profile} address={profile.address} {config} resolve/>
        </span>
        <div class="links">
          {#if profile.url}
            <a class="url mobile" href={profile.url}>
              <Icon name="url" inline />
            </a>
            <a class="url desktop" href={profile.url}>
              {profile.url}
            </a>
          {/if}
          {#if profile.twitter}
            <a class="url" href="https://twitter.com/{profile.twitter}">
              <Icon name="twitter" inline />
            </a>
          {/if}
          {#if profile.github}
            <a class="url" href="https://github.com/{profile.github}">
              <Icon name="github" inline />
            </a>
          {/if}
        </div>
      </div>
    </header>
      <div class="fields">
        <!-- Address -->
        <div class="label">Address</div>
        <div class="desktop"><Address {config} address={profile.address} /></div>
        <div class="mobile"><Address compact {config} address={profile.address} /></div>
        <div class="desktop" />
        <!-- Project anchors -->
        {#if profile.anchorsAccount}
          <div class="label">Anchors</div>
          <div class="desktop"><Address {config} address={profile.anchorsAccount} /></div>
          <div class="mobile"><Address compact {config} address={profile.anchorsAccount} /></div>
          <div class="desktop" />
        {/if}
        <!-- Seed Address -->
        {#if profile.seedId && profile.seedHost}
          <div class="label">Seed</div>
          <SeedAddress {config} id={profile.seedId} host={profile.seedHost} port={config.seed.link.port} />
        {/if}
        <!-- Profile -->
        <div class="label">Profile</div>
        <div>
          {#if profile.name}
            <a href={profile.registry(config)} class="link">{profile.name}</a>
          {:else}
            <span class="subtle">Not set</span>
          {/if}
        </div>
        <div class="desktop">
          {#if isAuthorized(profile.address)}
            <button class="tiny secondary" on:click={setName}>
              Set
            </button>
          {/if}
        </div>
      </div>
      {#await Org.getOrgsByMember(profile.address, config)}
        <Loading center />
      {:then orgs}
        {#if orgs.length > 0}
          <div class="members">
            {#each orgs as org}
              <div class="member">
                {#await Profile.get(org.address, ProfileType.Minimal, config)}
                  <Loading small margins />
                {:then profile}
                  <div class="member-icon">
                    <Link to="/orgs/{profile.address}">
                      <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
                    </Link>
                  </div>
                  <div class="desktop">
                    <Address address={profile.address} compact
                      resolve noBadge noAvatar {profile} {config} />
                  </div>
                {/await}
              </div>
            {/each}
          </div>
        {/if}
      {:catch err}
        <Message error>
          <strong>Error: </strong> failed to load orgs: {err.message}.
        </Message>
      {/await}
      <div class="projects">
        {#if profile.anchorsAccount}
          {#await Org.get(profile.anchorsAccount, config)}
            <Loading center fadeIn />
          {:then org}
            {#if org}
              {#await org.getProjects(config) then projects}
                {#each projects as project}
                  <div class="project">
                    <Project {project} user={addressOrName} config={profile.config(config)}>
                      <span slot="stateHash">
                        <span class="mobile">commit {formatCommit(project.anchor.stateHash)}</span>
                        <span class="desktop">commit {project.anchor.stateHash}</span>
                      </span>
                    </Project>
                  </div>
                {/each}
              {:catch err}
                <Message error>
                  <strong>Error: </strong> failed to load projects: {err.message}.
                </Message>
              {/await}
            {/if}
          {/await}
        {/if}
      </div>
  </main>
  <svelte:component this={setNameForm} entity={new User(profile.address)} {config} on:close={() => setNameForm = null} />
{:catch err}
  <Error error={err} />
{/await}
