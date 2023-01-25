<script lang="ts">
  import { onMount } from "svelte";
  import { ethers } from "ethers";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Link from "@app/components/Link.svelte";
  import {
    AddressType,
    formatAddress,
    identifyAddress,
    parseEnsLabel,
  } from "@app/lib/utils";
  import { Profile, ProfileType } from "@app/lib/profile";

  export let address: string;
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

  const addressOrName = profile?.ens?.name || address;

  onMount(async () => {
    if (!profile) {
      identifyAddress(address).then((t: AddressType) => (addressType = t));

      if (resolve) {
        Profile.get(address, ProfileType.Minimal).then(p => (profile = p));
      }
    } else {
      // If there is a profile we can use the profile.type to avoid identifying it again.
      addressType = profile.type;
    }
  });
  $: addressLabel =
    resolve && profile?.name
      ? compact
        ? parseEnsLabel(profile.name)
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
    <Link route={{ resource: "profile", params: { addressOrName } }}>
      {addressLabel}
    </Link>

    {#if !noBadge}
      {#if addressType === AddressType.Org}
        <Badge variant="foreground">org</Badge>
      {:else if addressType === AddressType.Vesting}
        <Badge variant="foreground">vesting contract</Badge>
      {:else if addressType === AddressType.Contract}
        <Badge variant="foreground">contract</Badge>
      {/if}
    {/if}
  </div>
</div>
