<script lang="typescript">
  import { ethers } from 'ethers';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import { Org } from './Org';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Error from '@app/Error.svelte';

  export let name: string;
  export let config: Config;

  let address = `${name}.${config.registrar.domain}`;

  const back = () => {
    navigate("/orgs");
  };
</script>

<style>
  .fields {
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 1rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
  }
</style>

{#await Org.get(address, config)}
  <Loading />
{:then org}
  {#if org}
    <div>
      <h1>
        {address}
      </h1>
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
    </div>
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
