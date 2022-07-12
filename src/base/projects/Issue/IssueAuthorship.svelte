<script lang="ts">
  import type { Config } from "@app/config";
  import type { Author } from "@app/issue";
  import { formatRadicleUrn, formatTimestamp } from "@app/utils";
  import Address from "@app/Address.svelte";
  import type { Profile } from "@app/profile";

  export let noAvatar = false;
  export let author: Author;
  export let timestamp: number;
  export let caption: string;
  export let config: Config;
  export let profile: Profile | null = null;
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
    <Address resolve address={profile.address} noBadge {noAvatar} compact small {config} {profile} />
  {:else if author.kind === "resolved"}
    <span class="highlight">
      {author.identity.name}
    </span>
  {:else if author.urn}
    <span class="highlight">
      {formatRadicleUrn(author.urn)}
    </span>
  {/if}
  <span class="desktop caption">&nbsp;{caption}&nbsp;</span>
  <span class="text-xsmall date desktop">
    {formatTimestamp(timestamp)}
  </span>
</span>
