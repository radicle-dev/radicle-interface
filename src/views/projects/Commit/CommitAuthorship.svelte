<script lang="ts">
  import type { CommitHeader } from "@httpd-client";

  import { formatTimestamp, gravatarURL } from "@app/lib/utils";

  export let header: CommitHeader;
</script>

<style>
  .authorship {
    display: flex;
    color: var(--color-foreground-6);
    font-size: var(--font-size-small);
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .person {
    display: flex;
    align-items: center;
    white-space: nowrap;
    gap: 0.5rem;
  }
  .avatar {
    width: 1rem;
    height: 1rem;
    border-radius: var(--border-radius-round);
  }
</style>

<span class="authorship">
  {#if header.author.email === header.committer.email}
    <div class="person">
      <img
        class="avatar"
        alt="avatar"
        src={gravatarURL(header.committer.email)} />
      {header.committer.name}
      committed
      {formatTimestamp(header.committer.time)}
    </div>
  {:else}
    <div class="person">
      <img class="avatar" alt="avatar" src={gravatarURL(header.author.email)} />
      {header.author.name}
      authored
    </div>
    <div class="person">
      <img
        class="avatar"
        alt="avatar"
        src={gravatarURL(header.committer.email)} />
      {header.committer.name}
      committed
      {formatTimestamp(header.committer.time)}
    </div>
  {/if}
</span>
