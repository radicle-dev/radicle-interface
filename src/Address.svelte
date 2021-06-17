<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { safeLink, identifyAddress, formatAddress, AddressType } from '@app/utils';
  import Loading from '@app/Loading.svelte';
  import Avatar from "@app/Avatar.svelte";
  import type { Config } from '@app/config';
  import type { Registration } from '@app/base/registrations/registrar';
  import { getRegistration } from '@app/base/registrations/registrar';

  export let address: string;
  export let config: Config;
  export let resolve = false;
  export let noBadge = false;
  export let noAvatar = false;
  export let compact = false;

  let checksumAddress = compact
    ? formatAddress(address)
    : ethers.utils.getAddress(address);
  let addressType: AddressType | null = null;
  let addressName: string | null = null;
  let info: Registration | null;

  onMount(async () => {
    identifyAddress(address, config).then((t: AddressType) => addressType = t);
    if (resolve) {
      addressName = await config.provider.lookupAddress(address);
      if (addressName) {
        info = await getRegistration(addressName, config);
      }
    }
  });
  $: addressLabel = addressName ?? checksumAddress;
</script>

<style>
  .address {
    display: flex;
    align-items: center;
    height: 100%;
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

<div class="address" title={address} class:no-badge={noBadge}>
  {#if !noAvatar}
    <Avatar inline source={info?.avatar ?? address} />
  {/if}
  {#if addressType === AddressType.Org}
    <a use:link href={`/orgs/${address}`}>{addressLabel}</a>
    <span class="badge">org</span>
  {:else if addressType === AddressType.Safe}
    <a href={safeLink(address, config)} target="_blank">{addressLabel}</a>
    <span class="badge safe">safe</span>
  {:else if addressType === AddressType.Contract}
    <a href={`/orgs/${address}`} target="_blank">{addressLabel}</a>
    <span class="badge">contract</span>
  {:else if addressType === AddressType.EOA}
    <a href={`/users/${address}`} target="_blank">{addressLabel}</a>
  {:else if !noBadge}
    <div class="loading"><Loading small /></div>
  {/if}
</div>
