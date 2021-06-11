<script lang="typescript">
  import { onMount } from 'svelte';
  import { link } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { explorerLink, safeLink } from '@app/utils';
  import Blockies from '@app/Blockies.svelte';
  import Loading from '@app/Loading.svelte';
  import type { Config } from '@app/config';
  import { identifyAddress, AddressType } from '@app/utils';

  export let address: string;
  export let config: Config;
  export let resolve = false;

  let checksumAddress = ethers.utils.getAddress(address);
  let addressType: AddressType | null = null;
  let addressName: string | null = null;

  onMount(() => {
    identifyAddress(address, config).then(typ => addressType = typ);
    if (resolve) {
      config.provider.lookupAddress(address).then(name => addressName = name);
    }
  });

  $: addressLabel = addressName || checksumAddress;
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
    color: var(--color-foreground-90);
  }
  .address a:hover {
    color: var(--color-foreground);
  }
  .loading {
    margin-left: 1rem;
    width: 4rem;
  }
</style>

<div class="address">
  <span class="icon"><Blockies address={address} /></span>
  {#if addressType === AddressType.Org}
    <a use:link href={`/orgs/${address}`}>{addressLabel}</a>
    <span class="badge">org</span>
  {:else if addressType === AddressType.Safe}
    <a href={safeLink(address, config)} target="_blank">{addressLabel}</a>
    <span class="badge safe">safe</span>
  {:else}
    <a href={explorerLink(address, config)} target="_blank">{addressLabel}</a>
    {#if addressType === AddressType.Contract}
      <span class="badge">contract</span>
    {:else if addressType === AddressType.EOA}
      <!-- Don't show anything for EOAs -->
    {:else}
      <div class="loading"><Loading small /></div>
    {/if}
  {/if}
</div>
