<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Org } from '@app/base/orgs/Org';
  import Avatar from '@app/Avatar.svelte';
  import { Profile } from '@app/profile';
  import type { Config } from '@app/config';
  import { formatName, formatAddress } from '@app/utils';
  import Loading from '@app/Loading.svelte';

  export let config: Config;
  export let orgs: Org[];

  const orgsAddresses = orgs.map(org => org.address);
</script>

<style>
  .org {
    width: 8rem;
    height: 8rem;
    margin-left: 3rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    display: inline-block;
    text-align: center;
  }
  .org:hover .org-label {
    color: var(--color-background);
    background: var(--color-secondary);
  }
  .org-avatar {
    margin: 0 auto;
    text-align: center;
    width: 3rem;
    height: 3rem;
  }
  .org-label {
    color: var(--color-foreground-90);
    display: inline-block;
    margin-top: 0.75rem;
    border-radius: 0.75rem;
    padding: 0rem 0.5rem;
    text-overflow: ellipsis;
    overflow-x: hidden;
    max-width: 8rem;
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
        <Link to={`/orgs/${profile.nameOrAddress}`}>
          <div class="org-avatar">
            <Avatar source={profile.avatar ?? profile.address} />
          </div>
          <div class="org-label">
            {#if profile.name}
              {formatName(profile.name, config)}
            {:else}
              {formatAddress(profile.address)}
            {/if}
          </div>
        </Link>
      </div>
    {:else}
      <slot />
    {/each}
  </div>
{/await}
