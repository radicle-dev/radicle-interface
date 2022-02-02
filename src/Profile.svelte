<script lang="ts">
  import type { Config } from '@app/config';
  import Address from '@app/Address.svelte';
  import Avatar from '@app/Avatar.svelte';
  import Icon from '@app/Icon.svelte';
  import SeedAddress from '@app/SeedAddress.svelte';
  import Link from '@app/Link.svelte';
import { Profile, ProfileType } from '@app/profile';
import Loading from '@app/Loading.svelte';
import { formatAddress, formatName } from '@app/utils';

  export let config: Config;
  export let addressOrName: string;

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
            {profile.name ? formatName(profile.name, config) : profile.address}
          </span>
          <span class="bold mobile">
            {profile.name ? formatName(profile.name, config) : formatAddress(profile.address)}
          </span>
          <span class="badge">org</span>
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
      <div class="label">Owner</div>
      <div class="desktop"><Address resolve {config} address={profile.address} /></div>
      <div class="mobile"><Address compact resolve {config} address={profile.address} /></div>
      <div class="desktop">
        <button class="tiny secondary" on:click={() => console.log("transfer ownership")}>
          Transfer
        </button>
      </div>
      <div class="label">Treasury</div>
      <div>
        1'000'000 USDC
      </div>
      <div class="desktop" />

      <!-- Seed Address -->
      {#if profile.seedId && profile.seedHost}
        <div class="label">Seed</div>
        <SeedAddress id={profile.seedId} host={profile.seedHost} port={config.seed.link.port} />
      {/if}
      <!-- Name/Profile -->
      <div class="label">Profile</div>
      <!-- Only show the name if we aren't already using the name of the owner -->
      <div class="overflow-text">
        <a href="/" class="link">radicle.eth</a>
        <span class="subtle">Not set</span>
      </div>
      <div class="desktop">
        <button class="tiny secondary" on:click={() => console.log("Set name")}>
          Set
        </button>
      </div>

      <!-- Quorum -->
      <div class="label">Quorum</div>
      <div>
        2 <span class="faded">of</span> 3
      </div>
      <div class="desktop"/>
    </div>

    <div class="members">
      <div class="member">
        <div class="member-icon">
          <Link to="/">
            <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
          </Link>
        </div>
        <div class="desktop">
          <Address address={profile.address} compact
            resolve noAvatar {config} />
        </div>
      </div>
    </div>

  </main>
{/await}