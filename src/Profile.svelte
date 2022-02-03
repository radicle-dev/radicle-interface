<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import type { Config } from '@app/config';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';
  import Icon from '@app/Icon.svelte';
  import SetName from '@app/ens/SetName.svelte';
  import SeedAddress from '@app/SeedAddress.svelte';
  import TransferOwnership from '@app/base/orgs/TransferOwnership.svelte';
  import Link from '@app/Link.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import Loading from '@app/Loading.svelte';
  import * as utils from '@app/utils';
  import { session } from '@app/session';
  import { Org } from '@app/base/orgs/Org';
  import Message from '@app/Message.svelte';
  import Error from '@app/Error.svelte';
  import { User } from '@app/base/users/User';
  import Projects from '@app/base/orgs/View/Projects.svelte';

  export let config: Config;
  export let addressOrName: string;
  export let action: string | null = null;

  let setNameForm: typeof SvelteComponent | null =
    action === "setName" ? SetName : null;
  const setName = () => {
    setNameForm = SetName;
  };

  let transferOwnerForm: typeof SvelteComponent | null = null;
  const transferOwnership = () => {
    transferOwnerForm = TransferOwnership;
  };
  $: account = $session && $session.address;
  $: isOwner = (org: Org): boolean => $session
    ? utils.isAddressEqual(org.owner, $session.address)
    : false;
  $: getOrgTreasury = async (org: Org): Promise<Array<utils.Token>| undefined> => {
    const addressType = await utils.identifyAddress(org.owner, config);
    // We query the org treasury only for Gnosis Safes, to maintain some privacy for EOA org owners.
    if (addressType === utils.AddressType.Safe) {
      try {
        const tokens = await utils.getTokens(org.owner, config);
        const balance = await config.provider.getBalance(org.owner);

        if (! balance.isZero()) {
          // To maintain the format we hardcode the ETH specs.
          return [{ balance, decimals: 18, logo: "", name: "Ethereum", symbol: "ETH" }, ...tokens];
        } else {
          return tokens;
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  $: isUserAuthorized = (address: string): boolean | null => {
    return $session && utils.isAddressEqual(address, $session.address);
  };
  $: isOrgAuthorized = async (org: Org): Promise<boolean> => {
    if ($session) {
      if (isOwner(org)) {
        return true;
      }
      return await org.isMember($session.address, config);
    }
    return false;
  };
</script>

<style>
  main {
    padding: 5rem 0;
    width: 720px;
  }
  main > header {
    display: flex;
    align-items: center;
    justify-content: left;
    margin-bottom: 2rem;
  }
  main > header > * {
    margin: 0 1rem 0 0;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;
  }
  .info a {
    border: none;
  }
  .fields {
    display: grid;
    grid-template-columns: 5rem 4fr 2fr;
    grid-gap: 1rem 2rem;
    margin-bottom: 1rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
    height: 2rem;
    line-height: 2rem;
  }
  .avatar {
    width: 64px;
    height: 64px;
  }
  .title {
    display: flex;
    align-items: center;
  }
  .links {
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .overflow-text {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .url {
    display: flex; /* Ensures correct vertical positioning of icons */
    margin-right: 1rem;
    height: 1.6rem;
  }
  .members {
    margin-top: 2rem;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }
  .members .member {
    display: flex;
    align-items: center;
    margin-right: 2rem;
    margin-bottom: 1rem;
  }
  .members .member:last-child {
    margin-right: 0;
  }
  .members .member-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
  }
  @media (max-width: 720px) {
    main {
      width: 100%;
      padding: 1.5rem;
    }
    .fields {
      grid-template-columns: 5rem auto;
    }
    .members .member {
      margin-right: 1rem;
    }
  }
</style>

<svelte:head>
  <title>{addressOrName}</title>
</svelte:head>

{#await Profile.get(addressOrName, ProfileType.Full, config)}
  <div class="off-centered">
    <Loading center />
  </div>
{:then profile}
  <main>
    <header>
      <div class="avatar">
        <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
      </div>
      <div class="info">
        <span class="title">
          <span class="bold desktop">
            {profile.name ? utils.formatName(profile.name, config) : profile.address}
          </span>
          <span class="bold mobile">
            {profile.name ? utils.formatName(profile.name, config) : utils.formatAddress(profile.address)}
          </span>
          {#if profile.name && profile.org}
            <span class="badge">org</span>
          {/if}
        </span>
        <div class="links">
          {#if profile.url}
            <a class="url" href={profile.url}>
              <span class="mobile">
                <Icon name="url" fill inline />
              </span>
              <span class="desktop">
                {profile.url}
              </span>
            </a>
          {/if}
          {#if profile.twitter}
            <a class="url" href="https://twitter.com/{profile.twitter}">
              <Icon name="twitter" fill inline />
            </a>
          {/if}
          {#if profile.github}
            <a class="url" href="https://github.com/{profile.github}">
              <Icon name="github" fill inline />
            </a>
          {/if}
        </div>
      </div>
    </header>

    <div class="fields">
      <!-- Address -->
      <div class="label">Address</div>
      <div class="desktop"><Address {config} address={profile.address} /></div>
      <div class="mobile"><Address compact {config} address={profile.address} /></div>
      <div class="desktop" />
      <!-- Owner -->
      {#if profile.org}
        <div class="label">Owner</div>
        <div class="desktop"><Address resolve {config} address={profile.org.owner} /></div>
        <div class="mobile"><Address compact resolve {config} address={profile.org.owner} /></div>
        <div class="desktop">
          {#if isOwner(profile.org) || (account && profile.org.isMember(account, config))}
            <button class="tiny secondary" on:click={transferOwnership}>
              Transfer
            </button>
          {/if}
        </div>
        <!-- Org Treasury -->
        {#await getOrgTreasury(profile.org) then tokens}
          {#if tokens && tokens.length > 0}
            <div class="label">Treasury</div>
            <div>
              {#each tokens as token}
                {` ${utils.formatBalance(token.balance, token.decimals)} ${token.symbol} `}
              {/each}
            </div>
            <div class="desktop" />
          {/if}
        {/await}
      {:else}
        <!-- Project anchors -->
        {#if profile.anchorsAccount}
          <div class="label">Anchors</div>
          <div class="desktop"><Address {config} address={profile.anchorsAccount} /></div>
          <div class="mobile"><Address compact {config} address={profile.anchorsAccount} /></div>
          <div class="desktop" />
        {/if}
      {/if}
      <!-- Seed Address -->
      {#if profile.seedId && profile.seedHost}
        <div class="label">Seed</div>
        <SeedAddress id={profile.seedId} host={profile.seedHost} port={config.seed.link.port} />
      {/if}
      <!-- Org Name/Profile -->
      <div class="label">Profile</div>
      {#if profile.org}
        {#if utils.isAddressEqual(profile.address, profile.org.address)}
          <div class="overflow-text">
            {#if profile.name}
              <a href={profile.registry(config)} class="link">{profile.name}</a>
            {:else}
              <span class="subtle">Not set</span>
            {/if}
          </div>
          <div class="desktop">
            {#await isOrgAuthorized(profile.org)}
              <!-- Loading -->
            {:then authorized}
              {#if authorized}
                <button class="tiny secondary" on:click={setName}>
                  Set
                </button>
              {/if}
            {/await}
          </div>
        {/if}
        <!-- Quorum -->
        {#await profile.org.getSafe(config) then safe}
          {#if safe}
            <div class="label">Quorum</div>
            <div>
              {safe.threshold} <span class="faded">of</span> {safe.owners.length}
            </div>
            <div class="desktop"/>
          {/if}
        {/await}
      {:else}
        <!-- User Profile -->
        <div>
          {#if profile.name}
            <a href={profile.registry(config)} class="link">{profile.name}</a>
          {:else}
            <span class="subtle">Not set</span>
          {/if}
        </div>
        <div class="desktop">
          {#if isUserAuthorized(profile.address)}
            <button class="tiny secondary" on:click={setName}>
              Set
            </button>
          {/if}
        </div>
      {/if}
    </div>

    {#if profile.org}
      {#await profile.org.getMembers(config)}
        <Loading center />
      {:then members}
        {#if members.length > 0}
          <div class="members">
            {#await Profile.getMulti(members, config)}
              <Loading small />
            {:then members}
              {#each members as profile}
                <div class="member">
                  <div class="member-icon">
                    <Link to="/{profile.address}">
                      <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
                    </Link>
                  </div>
                  <div class="desktop">
                    <Address address={profile.address} compact
                      resolve noAvatar {profile} {config} />
                  </div>
                </div>
              {/each}
            {/await}
          </div>
        {/if}
      {:catch err}
        <Message error>
          <strong>Error: </strong> failed to load org members: {err.message}.
        </Message>
      {/await}
    {:else}
      {#await Org.getOrgsByMember(profile.address, config)}
        <Loading center />
      {:then orgs}
        {#if orgs.length > 0}
          <div class="members">
            {#each orgs as org}
              <div class="member">
                {#await Profile.get(org.address, ProfileType.Minimal, config)}
                  <Loading small margins />
                {:then profile}
                  <div class="member-icon">
                    <Link to="/{profile.address}">
                      <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
                    </Link>
                  </div>
                  <div class="desktop">
                    <Address address={profile.address} compact
                      resolve noBadge noAvatar {profile} {config} />
                  </div>
                {/await}
              </div>
            {/each}
          </div>
        {/if}
      {:catch err}
        <Message error>
          <strong>Error: </strong> failed to load orgs: {err.message}.
        </Message>
      {/await}
    {/if}
    <Projects {profile} {account} config={profile.seed ? config.withSeed(profile.seed) : config} />
  </main>

  <svelte:component this={setNameForm} entity={profile.org ?? new User(profile.address)} {config} on:close={() => setNameForm = null} />
  <svelte:component this={transferOwnerForm} org={profile.org} {config} on:close={() => transferOwnerForm = null} />
{:catch err}
  <Error error={err} />
{/await}
