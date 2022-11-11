<!--
 @component
 ## Usage
 An inline element to show a ETH address or profile information (name and avatar).  
 Displays a blockie avatar if no profile or avatar is found  
 Allows the navigate to profiles or external sites, e.g. multisig safes
 
 ## Best Practices
 - Where possible we should pass in a resolved `profile`.
 
 ## Props
 @param address - ETH address in hex format
 @param wallet - Wallet configuration
 @param profile - A resolved profile, to reduce unnecessary profile resolving
 @param resolve - Defines if address should be resolved
 @param noBadge - Surpresses the display of address type as badge
 @param noAvatar - Surpresses the display of any type of avatar
 @param compact - Shrinks information like hex string address
 @param small - Reduces size of text content to `txt-small`
 @param tiny - Reduces size even further to `txt-tiny`
 @param highlight - Highlights text content
-->
<script lang="ts">
  import type { Wallet } from "@app/wallet";

  import Avatar from "@app/Avatar.svelte";
  import Badge from "@app/Badge.svelte";
  import Link from "@app/router/Link.svelte";
  import {
    AddressType,
    explorerLink,
    formatAddress,
    identifyAddress,
    parseEnsLabel,
  } from "@app/utils";
  import { Profile, ProfileType } from "@app/profile";
  import { ethers } from "ethers";
  import { onMount } from "svelte";

  export let address: string;
  export let wallet: Wallet;
  export let profile: Profile | null = null;
  export let resolve = false;
  export let noBadge = false;
  export let noAvatar = false;
  export let compact = false;
  export let small = false;
  export let tiny = false;
  export let highlight = false;

  let addressType: AddressType | null = null;

  const addressOrName = profile?.ens?.name || address;

  onMount(async () => {
    if (!profile) {
      identifyAddress(address, wallet).then(
        (t: AddressType) => (addressType = t),
      );

      if (resolve) {
        Profile.get(address, ProfileType.Minimal, wallet).then(
          p => (profile = p),
        );
      }
    } else {
      // If there is a profile we can use `profile.type` to avoid identifying it again.
      addressType = profile.type;
    }
  });
  $: addressLabel =
    resolve && profile?.name
      ? compact
        ? parseEnsLabel(profile.name, wallet)
        : profile.name
      : checksumAddress;
  $: checksumAddress = compact
    ? formatAddress(address)
    : ethers.utils.getAddress(address);
</script>

<style>
  .address {
    display: inline-flex;
    align-items: center;
    height: 100%;
  }
  .address a {
    color: var(--color-foreground-6);
  }
  .address a:hover {
    color: var(--color-foreground);
  }
  .highlight {
    color: var(--color-foreground-6);
    font-weight: var(--font-weight-bold);
  }
  .wrapper {
    gap: 0.5rem;
    display: flex;
    align-items: center;
  }
</style>

<div
  class="address"
  title={address}
  class:txt-small={small}
  class:txt-tiny={tiny}
  class:highlight>
  {#if !noAvatar}
    {#if resolve && profile?.avatar}
      <Avatar inline source={profile.avatar} title={address} />
    {:else}
      <Avatar inline source={address} title={address} />
    {/if}
  {/if}
  <div class="wrapper">
    {#if addressType === AddressType.Org}
      <Link
        route={{
          resource: "profile",
          params: { addressOrName: addressOrName },
        }}>
        {addressLabel}
      </Link>
      {#if !noBadge}
        <Badge variant="foreground">org</Badge>
      {/if}
    {:else if addressType === AddressType.Contract}
      <Link route={{ resource: "profile", params: { addressOrName: address } }}>
        {addressLabel}
      </Link>
      {#if !noBadge}
        <Badge variant="foreground">contract</Badge>
      {/if}
    {:else if addressType === AddressType.EOA}
      <Link
        route={{
          resource: "profile",
          params: { addressOrName: addressOrName },
        }}>
        {addressLabel}
      </Link>
    {:else}
      <!-- While we're waiting to find out what address type it is -->
      <a href={explorerLink(address, wallet)} target="_blank" rel="noreferrer">
        {addressLabel}
      </a>
    {/if}
  </div>
</div>
