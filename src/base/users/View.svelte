<script lang="typescript">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/registrations/registrar';
  import { getRegistration } from '@app/base/registrations/registrar';
  import Icon from '@app/Icon.svelte';
  import Modal from '@app/Modal.svelte';
  import Loading from '@app/Loading.svelte';
  import Address from '@app/Address.svelte';
  import Link from '@app/Link.svelte';
  import Avatar from '@app/Avatar.svelte';
  import Error from '@app/Error.svelte';

  enum Status {
    Loading,
    Found,
    NotFound,
    Failed,
  }

  type State =
      { status: Status.Loading }
    | { status: Status.NotFound }
    | { status: Status.Found, registration: Registration }
    | { status: Status.Failed, error: string };

  export let address: string;
  export let config: Config;

  let name: string | null = null;
  let state: State = { status: Status.Loading };
  
  onMount(async () => {
    name = await config.provider.lookupAddress(address);
    getRegistration(name, config)
      .then(r => {
        if (r) {
          state = { status: Status.Found, registration: r };
        } else {
          state = { status: Status.NotFound };
        }
        return r;
      }).catch(err => {
        state = { status: Status.Failed, error: err };
    });
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

{#if state.status === Status.Loading}
  <Loading fadeIn />
{:else if state.status === Status.Failed}
  <Error title="User could not be loaded" on:close={() => navigate('/')}>
    {state.error}
  </Error>
{:else if state.status === Status.NotFound}
  <Modal subtle>
    <span slot="title">
      {address}
    </span>

    <span slot="body">
      <p>The address <strong>{address}</strong> is not registered.</p>
    </span>

    <span slot="actions">
      <Link to={`/`} primary>Back to home &rarr;</Link>
    </span>
  </Modal>
{:else if state.status === Status.Found}
  <main>
    <header>
      <div class="avatar">
        <Avatar icon={false} source={state.registration?.avatar ?? address} />
      </div> 
      <div class="info">
        <span class="title bold"><Address noAvatar {address} {config} resolve/></span>
        <div class="links">
          {#if state.registration}
            {#if state.registration.url}
              <a class="url" href={state.registration.url}>{state.registration.url}</a>
            {/if}
            {#if state.registration.twitter}
              <a class="url" href={state.registration.twitter}>
                <Icon name="twitter" />
              </a>
            {/if}
            {#if state.registration.github}
              <a class="url" href={state.registration.github}>
                <Icon name="github" />
              </a>
            {/if}
          {/if}
        </div>
      </div>
    </header> 
  </main>
{/if}