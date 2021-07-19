<script lang="ts">
  import type { Config } from '@app/config';
  import Icon from '@app/Icon.svelte';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Profile } from '@app/profile';
  import Loading from '@app/Loading.svelte';

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
        <span class="title bold"><Address compact noAvatar {address} {config} resolve/></span>
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
  </main>
{/await}
