<script lang="typescript">
  import { ethers } from 'ethers';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/register/registrar';
  import { getRegistration } from '@app/base/register/registrar';
  import { Org } from './Org';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Error from '@app/Error.svelte';
  import Icon from '@app/Icon.svelte';

  export let name: string;
  export let config: Config;

  let address = `${name}.${config.registrar.domain}`;
  let registration: Registration | null = null;
  let loading = true;

  getRegistration(name, config).then(r => {
    registration = r;
    loading = false;
  });

  const back = () => navigate("/orgs");
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
  .fields {
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 1rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
  }
  .actions {
    margin-top: 2rem;
  }
  .avatar {
    width: 64px;
    height: 64px;
  }
  .links {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .url {
    display: flex; /* Ensures correct vertical positioning of icons */
    margin-right: 1rem;
  }
</style>

{#await Org.get(address, config)}
  <Loading />
{:then org}
  {#if org}
    <main>
      <header>
        {#if registration && registration.avatar}
          <div class="avatar">
            <img src={registration.avatar} alt="avatar" />
          </div>
        {/if}
        <div class="info">
          <span class="title bold">{address}</span>
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
        <div>
          {#if loading}
            <Loading small />
          {/if}
        </div>
      </header>

      <div class="fields">
        <div class="label">Address</div><div>{org.address}</div>
        <div class="label">Owner</div><div>{org.safe}</div>
        <div class="label">Reverse Entry</div>
        <div>
          {#await org.lookupAddress(config)}
            <Loading small />
          {:then name}
            {#if name}
              {name}
            {:else}
              <span class="subtle">Not registered</span>
            {/if}
          {/await}
        </div>
      </div>

      <div class="actions">
        <button on:click={() => navigate(`/registrations/${name}`)} class="tiny secondary">
          View registration &rarr;
        </button>
      </div>
    </main>
  {:else}
    <Modal subtle>
      <span slot="title">🏜️</span>
      <span slot="body">Sorry, <span class="highlight">{address}</span> does not resolve to an Org address.</span>
      <span slot="actions">
        <button on:click={back}>
          Back
        </button>
      </span>
    </Modal>
  {/if}
{:catch err}
  <Error error={err} />
{/await}
