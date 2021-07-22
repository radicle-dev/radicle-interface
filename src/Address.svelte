<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { safeLink, explorerLink, identifyAddress, formatAddress, AddressType, parseEnsLabel } from '@app/utils';
  import { Profile } from '@app/profile';
  import Loading from '@app/Loading.svelte';
  import Avatar from "@app/Avatar.svelte";
  import type { Config } from '@app/config';

  export let address: string;
  export let config: Config;
  export let resolve = false;
  export let noBadge = false;
  export let noAvatar = false;
  export let compact = false;
  // This property allows components eg. Header.svelte to pass a resolved profile object.
  export let profile: Profile | null = null;

  let checksumAddress = compact
    ? formatAddress(address)
    : ethers.utils.getAddress(address);
  let addressType: AddressType | null = null;

  onMount(async () => {
    identifyAddress(address, config).then((t: AddressType) => addressType = t);
    if (resolve && !profile) {
      Profile.get(address, config).then(p => profile = p);
    }
  });
  $: addressLabel = profile?.name ? compact ? parseEnsLabel(profile.name, config) : profile.name : checksumAddress;
</script>

<style>
  .address {
    display: inline-flex;
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
    height: 1.5rem;
  }
</style>

<div class="address" title={address} class:no-badge={noBadge}>
  {#if !noAvatar}
    <Avatar inline source={profile?.avatar ?? address} />
  {/if}
  {#if addressType === AddressType.Org}
    <a use:link href={`/orgs/${address}`}>{addressLabel}</a>
    <span class="badge">org</span>
  {:else if addressType === AddressType.Safe}
    <a href={safeLink(address, config)} target="_blank">{addressLabel}</a>
    <span class="badge safe">safe</span>
  {:else if addressType === AddressType.Contract}
    <a href={explorerLink(address, config)} target="_blank">{addressLabel}</a>
    <span class="badge">contract</span>
  {:else if addressType === AddressType.EOA}
    <a href={`/users/${address}`}>{addressLabel}</a>
  {:else if profile?.name} <!-- While we're waiting to find out what address type it is -->
    <a href={explorerLink(address, config)} target="_blank">{addressLabel}</a>
  {:else}
    <div class="loading"><Loading small /></div>
  {/if}
</div>
