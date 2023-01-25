<script lang="ts">
  import type { Author } from "@app/lib/cobs";

  import { onMount } from "svelte";

  import Address from "@app/components/Address.svelte";
  import { Profile, ProfileType } from "@app/lib/profile";
  import {
    formatRadicleId,
    formatSeedId,
    formatTimestamp,
  } from "@app/lib/utils";

  export let noAvatar = false;
  export let author: Author;
  export let timestamp: number;
  export let caption: string;
  export let profile: Profile | null = null;

  onMount(async () => {
    if (author.profile?.ens?.name) {
      try {
        profile = await Profile.get(
          author.profile.ens.name,
          ProfileType.Minimal,
        );
      } catch {
        // Ignore profile not found.
      }
    }
  });
</script>

<style>
  .authorship {
    display: flex;
    align-items: center;
    color: var(--color-foreground);
    padding: 0.125rem 0;
  }
  .caption {
    color: var(--color-foreground-5);
  }
  .highlight {
    color: var(--color-foreground-6);
    font-weight: var(--font-weight-bold);
  }
  .date {
    color: var(--color-foreground-6);
  }
</style>

<span class="authorship txt-tiny">
  {#if profile}
    <Address
      tiny
      highlight
      resolve
      noBadge
      compact
      {noAvatar}
      {profile}
      address={profile.address} />
  {:else if author.profile}
    <span class="highlight">
      {author.profile.name}
    </span>
  {:else}
    <span class="highlight">
      {window.HEARTWOOD ? formatSeedId(author.id) : formatRadicleId(author.id)}
    </span>
  {/if}
  <span class="caption">&nbsp;{caption}&nbsp;</span>
  <span class="txt-tiny date">
    {formatTimestamp(timestamp)}
  </span>
</span>
