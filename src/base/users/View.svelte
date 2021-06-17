<script lang="ts">
  import { onMount } from 'svelte';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/registrations/registrar';
  import { getRegistration } from '@app/base/registrations/registrar';
  import Icon from '@app/Icon.svelte';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';

  export let address: string;
  export let config: Config;
  
  let addressName: string | null = null;
  let info: Registration | null;
  
  onMount(async () => {
    addressName = await config.provider.lookupAddress(address);
    info = await getRegistration(addressName, config);
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

<main>
  <header>
    <div class="avatar">
      <Avatar source={info?.avatar ?? address} />
    </div> 
    <div class="info">
      <span class="title bold"><Address noAvatar {address} {config} resolve/></span>
        <div class="links">
          {#if info?.url}
            <a class="url" href={info.url}>{info.url}</a>
          {/if}
          {#if info?.twitter}
            <a class="url" href={info.twitter}>
              <Icon name="twitter" />
            </a>
          {/if}
          {#if info?.github}
            <a class="url" href={info.github}>
              <Icon name="github" />
            </a>
          {/if}
        </div>
      </div>
    </header> 
  </main>
