<script lang="ts">
  import { ethers } from 'ethers';
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import type { Org } from '@app/base/orgs/Org';
  import Avatar from '@app/Avatar.svelte';
  import { Profile } from '@app/profile';
  import type { Config } from '@app/config';
  import { formatName, formatAddress } from '@app/utils';
  import Loading from '@app/Loading.svelte';

  export let config: Config;
  export let orgs: Org[];

  const orgMembers: Record<string, string[]> = {};
  const getProfiles = Profile.getMulti(orgs.map(o => o.name ?? o.address), config);

  onMount(async () => {
    const promises = orgs.map(org => org.getMembers(config).then(members => {
      orgMembers[ethers.utils.getAddress(org.address)] = members;
    }));

    Promise.all(promises);
  });
</script>

<style>
  .org {
    width: 10rem;
    height: 10rem;
    margin-right: 3rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    display: inline-block;
    text-align: center;
    border-radius: 1rem;
  }
  .org::last-child {
    margin-right: 0;
  }
  .org:hover  {
    background: var(--color-foreground-background-lighter);
  }
  .org-avatar {
    margin: 0 auto;
    text-align: center;
    width: 4rem;
    height: 4rem;
  }
  .org-label {
    color: var(--color-foreground-90);
    display: inline-block;
    font-weight: var(--font-weight-medium);
    margin-top: 0.75rem;
    border-radius: 0.75rem;
    padding: 0rem 0.5rem;
    text-overflow: ellipsis;
    overflow-x: hidden;
    max-width: 8rem;
  }
  .org-members {
    font-size: 0.875rem;
    color: var(--color-foreground-faded);
  }
  .list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .loading {
    padding: 3rem 0;
  }
</style>

{#await getProfiles}
  <div class="loading">
    <Loading center />
  </div>
{:then profiles}
  <div class="list">
    {#each profiles as profile}
      <Link to={`/orgs/${profile.nameOrAddress}`}>
        <div class="org">
          <div class="org-avatar">
            <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
          </div>
          <div class="org-label">
            {#if profile.name}
              {formatName(profile.name, config)}
            {:else}
              {formatAddress(profile.address)}
            {/if}
          </div>
          <div class="org-members">
            {#if orgMembers[profile.address]?.length}
              {orgMembers[profile.address].length} members
            {:else}
              {formatAddress(profile.address)}
            {/if}
          </div>
        </div>
      </Link>
    {:else}
      <slot />
    {/each}
  </div>
{/await}
