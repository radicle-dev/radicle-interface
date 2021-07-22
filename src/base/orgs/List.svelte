<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Org } from '@app/base/orgs/Org';
  import Avatar from '@app/Avatar.svelte';
  import { Profile } from '@app/profile';
  import type { Config } from '@app/config';
  import Loading from '@app/Loading.svelte';

  export let config: Config;
  export let orgs: Org[];

  const orgsAddresses = orgs.map(org => org.address);
</script>

<style>
  .org {
    width: 3rem;
    height: 3rem;
    margin: 3rem;
    display: inline-block;
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

{#await Profile.getMulti(orgsAddresses, config)}
  <div class="loading">
    <Loading center /> 
  </div>
{:then profiles}
  <div class="list">
    {#each profiles as profile}
      <div class="org">
        <Link to={`/orgs/${profile.address}`}>
          <Avatar glowOnHover source={profile.avatar ?? profile.address} />
        </Link>
      </div>
    {:else}
      <slot />
    {/each}
  </div>
{/await}
