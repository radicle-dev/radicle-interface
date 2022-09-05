<script lang="ts">
  import { onMount } from "svelte";
  import Avatar from "@app/Avatar.svelte";
  import type { Profile } from "@app/profile";
  import type { Config } from "@app/config";
  import { formatName, formatAddress } from "@app/utils";
  import type { Seed } from "@app/base/seeds/Seed";
  import Loading from "@app/Loading.svelte";

  export let profile:
    | Profile
    | {
        address: string;
        avatar?: string;
        name?: string;
      }
    | null = null;
  export let seed: Seed | null = null;
  export let config: Config;
  export let path: string;
  export let members: string[] = [];

  let numberOfProjects: number | null = null;

  onMount(async () => {
    if (seed) {
      const projects = await seed.getProjects();
      numberOfProjects = projects.length;
    }
  });
</script>

<style>
  .card {
    width: 12rem;
    height: 10.5rem;
    margin-right: 1.5rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    display: inline-block;
    text-align: center;
    border-radius: var(--border-radius);
  }
  .card::last-child {
    margin-right: 0;
  }
  .card:hover {
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
    border-radius: var(--border-radius);
    padding: 0rem;
    text-overflow: ellipsis;
    overflow-x: hidden;
  }
  .card-members {
    font-size: 0.875rem;
    color: var(--color-foreground-faded);
  }

  .card.seed {
    width: 14rem;
  }
  .card.seed .card-label {
    max-width: 12rem;
  }
  .card.seed .seed-emoji {
    font-size: 3rem;
  }

  @media (max-width: 720px) {
    .card {
      margin-right: 0;
    }
  }
</style>

<a href={path}>
  <div class="card" class:seed={!!seed}>
    <div class="card-avatar">
      {#if profile}
        <Avatar
          source={profile.avatar ?? profile.address}
          title={profile.address} />
      {:else if seed}
        <span class="seed-emoji">
          {seed.emoji}
        </span>
      {/if}
    </div>
    <div class="card-label">
      {#if profile}
        {#if profile.name}
          {formatName(profile.name, config)}
        {:else}
          {formatAddress(profile.address)}
        {/if}
      {:else if seed}
        {seed.host}
      {/if}
    </div>
    <div class="card-members">
      {#if profile}
        {#if members.length > 0}
          {members.length} member(s)
        {:else}
          {formatAddress(profile.address)}
        {/if}
      {:else if numberOfProjects !== null}
        {#if numberOfProjects > 0}
          {numberOfProjects} project(s)
        {:else}
          No projects
        {/if}
      {:else if numberOfProjects === null}
        <Loading center fadeIn small />
      {/if}
    </div>
  </div>
</a>
