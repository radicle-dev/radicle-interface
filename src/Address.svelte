<script lang="ts">
  import { onMount } from "svelte";
  import { link } from "svelte-routing";
  import { ethers } from "ethers";
  import {
    explorerLink,
    identifyAddress,
    formatAddress,
    AddressType,
    parseEnsLabel,
  } from "@app/utils";
  import { Profile, ProfileType } from "@app/profile";
  import Avatar from "@app/Avatar.svelte";
  import Badge from "@app/Badge.svelte";
  import type { Wallet } from "@app/wallet";

  export let address: string;
  export let wallet: Wallet;
  export let resolve = false;
  export let noBadge = false;
  export let noAvatar = false;
  export let compact = false;
  export let small = false;
  export let tiny = false;
  export let highlight = false;
  // This property allows components eg. Header.svelte to pass a resolved profile object.
  export let profile: Profile | null = null;

  let addressType: AddressType | null = null;

  const nameOrAddress = profile?.ens?.name || address;

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
      // If there is a profile we can use the profile.type to avoid identifying it again.
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
      <a use:link href={`/${nameOrAddress}`}>{addressLabel}</a>
      {#if !noBadge}
        <Badge variant="foreground">org</Badge>
      {/if}
    {:else if addressType === AddressType.Contract}
      <a use:link href={`/${address}`}>
        {addressLabel}
      </a>
      {#if !noBadge}
        <Badge variant="foreground">contract</Badge>
      {/if}
    {:else if addressType === AddressType.EOA}
      <a use:link href={`/${nameOrAddress}`}>{addressLabel}</a>
    {:else}
      <!-- While we're waiting to find out what address type it is -->
      <a href={explorerLink(address, wallet)} target="_blank" rel="noreferrer">
        {addressLabel}
      </a>
    {/if}
  </div>
</div>
