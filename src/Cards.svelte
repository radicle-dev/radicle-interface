<script lang="ts">
  import { onMount } from 'svelte';
  import { Profile, ProfileType } from '@app/profile';
  import Card from '@app/Card.svelte';
  import type { Org } from '@app/base/orgs/Org';
  import type { Config } from '@app/config';

  export let config: Config;
  export let orgs: Org[] = [];
  export let profiles: Profile[] = [];

  const orgMembers: Record<string, string[]> = {};

  onMount(async () => {
    const promises = orgs.map(org => {
      org.getMembers(config).then(members => {
        orgMembers[org.address] = members;
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
  @media (max-width: 720px) {
    .list {
      justify-content: center;
    }
  }
</style>

  <div class="list">
    {#each orgs as org}
      {#await Profile.get(org.name ?? org.address, ProfileType.Minimal, config)}
        <Card profile={{ address: org.address }} {config} path={`/${org.address}`} />
      {:then profile}
        {#if orgMembers[profile.address]?.length}
          <Card {profile} {config} path={`/${profile.nameOrAddress}`} members={orgMembers[profile.address]} />
        {:else}
          <Card {profile} {config} path={`/${profile.nameOrAddress}`} />
        {/if}
      {/await}
    {/each}

    {#each profiles as profile}
      <Card {profile} {config} path={`/${profile.nameOrAddress}`} />
    {/each}

    {#if !orgs.length && !profiles.length}
      <slot />
    {/if}
  </div>
