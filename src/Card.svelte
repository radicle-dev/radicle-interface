<script lang="ts">
  import { Link } from 'svelte-routing';
  import Avatar from '@app/Avatar.svelte';
  import type { Profile } from '@app/profile';
  import type { Config } from '@app/config';
  import { formatName, formatAddress } from '@app/utils';

  export let profile: Profile | {
    address: string;
    avatar?: string;
    name?: string;
  } ;
  export let config: Config;
  export let path: string;
  export let members: string[] = [];
</script>

<style>
  .card {
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
  .card::last-child {
    margin-right: 0;
  }
  .card:hover  {
    background: var(--color-foreground-background-lighter);
  }
  .card-avatar {
    margin: 0 auto;
    text-align: center;
    width: 4rem;
    height: 4rem;
  }
  .card-label {
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
  .card-members {
    font-size: 0.875rem;
    color: var(--color-foreground-faded);
  }

  @media (max-width: 720px) {
    .card {
      margin-right: 0;
    }
  }
</style>

<Link to={path}>
  <div class="card">
    <div class="card-avatar">
      <Avatar source={profile.avatar ?? profile.address} address={profile.address} />
    </div>
    <div class="card-label">
      {#if profile.name}
        {formatName(profile.name, config)}
      {:else}
        {formatAddress(profile.address)}
      {/if}
    </div>
    <div class="card-members">
      {#if members.length > 0}
        {members.length} members
      {:else}
        {formatAddress(profile.address)}
      {/if}
    </div>
  </div>
</Link>
