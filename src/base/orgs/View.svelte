<script lang="ts">
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import { explorerLink } from '@app/utils';
  import Modal from '@app/Modal.svelte';
  import * as utils from '@app/utils';
  import { Org } from '@app/base/orgs/Org';
  import Loading from '@app/Loading.svelte';

  export let addressOrName: string;
  export let config: Config;

  const back = () => window.history.back();
  let org: Org | null;

  const checkForOrg = async () => {
    org = await Org.get(addressOrName, config);
    if (org) navigate(`/${addressOrName}`);
    else return false
  }
</script>
  
<svelte:head>
  <title>{utils.formatOrg(addressOrName, config)}</title>
</svelte:head>

{#await checkForOrg()}
  <Loading center />
{:then isOrg} 
  {#if !isOrg}
    <Modal subtle>
      <span slot="title">🏜️</span>
      <span slot="body">
        <p class="highlight"><strong>{addressOrName}</strong></p>
        <p>Sorry, there is no Org at this address.</p>
        {#if utils.isAddress(addressOrName)}
          <p>
            <a href={explorerLink(addressOrName, config)} class="link" target="_blank">View in explorer</a>
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
{/await}
