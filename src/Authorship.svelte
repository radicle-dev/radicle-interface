<script lang="ts">
  import type { Config } from "@app/config";
  import { formatRadicleUrn, formatTimestamp } from "@app/utils";
  import Address from "@app/Address.svelte";
  import { Profile, ProfileType } from "@app/profile";
  import { onMount } from "svelte";
  import type { Author } from "@app/cobs";

  export let noAvatar = false;
  export let author: Author;
  export let timestamp: number;
  export let caption: string;
  export let config: Config;
  export let profile: Profile | null = null;

  onMount(async () => {
    if (author.profile?.ens?.name) {
      profile = await Profile.get(author.profile.ens.name, ProfileType.Minimal, config);
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
    color: var(--color-foreground-faded);
  }
  .highlight {
    color: var(--color-foreground-90);
    font-weight: bold;
  }
  .date {
    color: var(--color-foreground-80);
  }
</style>

<span class="authorship text-xsmall">
  {#if profile}
    <Address
      xsmall highlight resolve noBadge compact {noAvatar} {config} {profile}
      address={profile.address} />
  {:else if author.profile}
    <span class="highlight">
      {author.profile.name}
    </span>
  {:else}
    <span class="highlight">
      {formatRadicleUrn(author.urn)}
    </span>
  {/if}
  <span class="caption">&nbsp;{caption}&nbsp;</span>
  <span class="text-xsmall date">
    {formatTimestamp(timestamp)}
  </span>
</span>
