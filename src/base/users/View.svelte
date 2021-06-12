<script lang="typescript">
  import { onMount } from 'svelte';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/registrations/registrar';
  import { getRegistration } from '@app/base/registrations/registrar';
  import Icon from '@app/Icon.svelte';
  import Blockies from '@app/Blockies.svelte';
  import Loading from '@app/Loading.svelte';
  import Address from '@app/Address.svelte';

  export let address: string;
  export let config: Config;

  let loading: boolean = true;
  let registration: Registration | null = null;
  let name: string | null = null;

  onMount(async () => {
    name = await config.provider.lookupAddress(address);
    if (name) registration = await getRegistration(name, config);
    loading = false;
  });
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
  .avatar img {
    border-radius: 50%; /* Allowing to maintain the circular design of the avatars */
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

{#if loading}
  <Loading fadeIn />
{:else}
  <main>
    <header>
      <div class="avatar">
        {#if registration && registration.avatar}
          <img class="avatar" src={registration.avatar} alt="avatar" />
        {:else}
          <Blockies {address} />
        {/if}
      </div>
      <div class="info">
        <span class="title bold"><Address {address} {config} resolve/></span>
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
  </main>
{/if}