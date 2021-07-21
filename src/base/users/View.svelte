<script lang="ts">
  import type { Config } from '@app/config';
  import Icon from '@app/Icon.svelte';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Profile } from '@app/profile';
  import Loading from '@app/Loading.svelte';
  import { Org } from '@app/base/orgs/Org';
  import Message from '@app/Message.svelte';
  import Project from '@app/base/projects/Widget.svelte';

  export let address: string;
  export let config: Config;
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

{#await Profile.get(address, config)}
  <Loading fadeIn />
{:then profile}
  <main>
    <header>
      <div class="avatar">
        <Avatar source={profile.avatar ?? address} />
      </div>
      <div class="info">
        <span class="title bold">
          <Address compact noAvatar noBadge {address} {config} resolve/>
        </span>
        <div class="links">
          {#if profile.url}
            <a class="url" href={profile.url}>{profile.url}</a>
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
      <div class="projects">
        {#await Org.getOrgsByOwner(address, config)}
          <Loading center fadeIn />
        {:then orgs}
          {#each orgs as org}
            {#await org.getProjects(config) then projects}
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
          {/each}
        {/await}
      </div>
  </main>
{/await}
