<script lang="ts">
  import { ethers } from 'ethers';
  import { onMount } from 'svelte';
  import type { Org } from '@app/base/orgs/Org';
  import { Profile } from '@app/profile';
  import type { Config } from '@app/config';
  import Loading from '@app/Loading.svelte';
  import Card from '@app/Card.svelte';

  export let config: Config;
  export let orgs: Org[] = [];
  export let profiles: Profile[] = [];

  const orgMembers: Record<string, string[]> = {};
  const getOrgProfiles = Profile.getMulti(orgs.map(o => o.name ?? o.address), config);

  onMount(async () => {
    const promises = orgs.map(org => {
      org.getMembers(config).then(members => {
        orgMembers[ethers.utils.getAddress(org.address)] = members;
      });
    });

    Promise.all(promises);
  });
</script>

<style>
  .list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .loading {
    padding: 3rem 0;
  }
</style>

{#await getOrgProfiles}
  <div class="loading">
    <Loading center />
  </div>
{:then orgProfiles}
  <div class="list">
    {#each orgProfiles as profile}
      {#if orgMembers[profile.address]?.length}
        <Card {profile} {config} path={`/orgs/${profile.nameOrAddress}`} members={orgMembers[profile.address]} />
      {:else}
        <Card {profile} {config} path={`/orgs/${profile.nameOrAddress}`} />
      {/if}
    {/each}

    {#each profiles as profile}
      <Card {profile} {config} path={`/users/${profile.nameOrAddress}`} />
    {/each}

    {#if !orgProfiles.length && !profiles.length}
      <slot />
    {/if}
  </div>
{/await}
