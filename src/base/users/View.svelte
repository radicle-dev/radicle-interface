<script lang="ts">
  import type { Config } from '@app/config';
  import Icon from '@app/Icon.svelte';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { ProfileType, Profile } from '@app/profile';
  import Loading from '@app/Loading.svelte';
  import { Org } from '@app/base/orgs/Org';
  import Message from '@app/Message.svelte';
  import Project from '@app/base/projects/Widget.svelte';

  export let addressOrName: string;
  export let config: Config;
</script>

<style>
  main {
    padding: 5rem 0;
    width: 36rem;
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
  .projects {
    margin-top: 2rem;
  }
  .projects .project {
    margin-bottom: 1rem;
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
            <a class="url" href={profile.url}>{profile.url}</a>
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
        <div><Address noAvatar {config} address={profile.address} /></div>
        <div></div>
        <!-- Profile -->
        <div class="label">Profile</div>
        <div>
          {#if profile.name}
            <a href={profile.registry(config)} class="link" target="_blank">{profile.name}</a>
          {:else}
            <span class="subtle">Not set</span>
          {/if}
        </div>
      </div>
      <div class="projects">
        {#await Org.getOrgsByOwner(profile.address, config)}
          <Loading center fadeIn />
        {:then orgs}
          {#each orgs as org}
            {#await org.getProjects(config) then projects}
              {#each projects as project}
                <div class="project">
                  <Project {project} org={org.address} config={profile.config(config)} />
                </div>
              {/each}
            {:catch err}
              <Message error>
                <strong>Error: </strong> failed to load projects: {err.message}.
              </Message>
            {/await}
          {/each}
        {/await}
      </div>
  </main>
{/await}
