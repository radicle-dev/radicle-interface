<script lang="typescript">
  import { onMount } from 'svelte';
  import { link } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { safeLink } from '@app/utils';
  import Loading from '@app/Loading.svelte';
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/registrations/registrar';
  import { getRegistration } from '@app/base/registrations/registrar';
  import { identifyAddress, formatAddress, AddressType } from '@app/utils';

  export let address: string;
  export let config: Config;
  export let resolve = false;
  export let noBadge = false;
  export let compact = false;

  let checksumAddress = compact
    ? formatAddress(address)
    : ethers.utils.getAddress(address);
  let loading: boolean = true;
  let registration: Registration | null = null;
  let addressType: AddressType | null = null;
  let addressName: string | null = null;

  onMount(async () => {
    if (resolve) {
      addressName = await config.provider.lookupAddress(address);
      if (addressName) registration = await getRegistration(addressName, config);
    }
    addressType = await identifyAddress(address, config);
    loading = false;
  });

  $: addressLabel = addressName || checksumAddress;
</script>

<style>
  .address {
    display: flex;
    align-items: center;
  }
  .address.no-badge .badge {
    display: none;
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

{#if loading}
  <Loading fadeIn/>
{:else}
<div class="address" title={address} class:no-badge={noBadge}>
  {#if addressType === AddressType.Org}
    <a use:link href={`/orgs/${address}`}>{addressLabel}</a>
    <span class="badge">org</span>
  {:else if addressType === AddressType.Safe}
    <a href={safeLink(address, config)} target="_blank">{addressLabel}</a>
    <span class="badge safe">safe</span>
  {:else}
    <a href={`/users/${address}`} target="_blank">{addressLabel}</a>
    {#if addressType === AddressType.Contract}
      <span class="badge">contract</span>
    {:else if addressType === AddressType.EOA}
      <!-- Don't show anything for EOAs -->
    {:else if !noBadge}
      <div class="loading"><Loading small /></div>
    {/if}
  {/if}
</div>
{/if}
