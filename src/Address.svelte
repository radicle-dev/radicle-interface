<script lang="typescript">
  import { onMount } from 'svelte';
  import { link } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { explorerLink } from '@app/utils';
  import Blockies from '@app/Blockies.svelte';
  import Loading from '@app/Loading.svelte';
  import type { Config } from '@app/config';

  export let address: string;
  export let config: Config;

  let checksumAddress = ethers.utils.getAddress(address);
  let isContract = false;
  let isOrg = false;

  onMount(async () => {
    let code = await config.provider.getCode(address);
    let bytes = ethers.utils.arrayify(code);

    isContract = bytes.length > 0;
    isOrg = ethers.utils.keccak256(bytes) === config.orgs.contractHash;
  });
</script>

<style>
  .address {
    display: flex;
    align-items: center;
  }
  .icon {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
    min-width: 1rem;
    min-height: 1rem;
  }
  .address a {
    border-bottom: none;
  }
  .loading {
    margin-left: 1rem;
    width: 4rem;
  }
</style>

<div class="address">
  <span class="icon"><Blockies address={address} /></span>
  {#if isOrg}
    <a use:link href={`/orgs/${address}`}>{checksumAddress}</a>
    <span class="badge">org</span>
  {:else if isContract}
    <a href={explorerLink(address, config)} target="_blank">{checksumAddress}</a>
    <span class="badge">contract</span>
  {:else}
    <a href={explorerLink(address, config)} target="_blank">{checksumAddress}</a>
    <div class="loading"><Loading small /></div>
  {/if}
</div>
