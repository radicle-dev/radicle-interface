<script lang="ts">
  import type { CommitHeader } from "@httpd-client";

  import { formatTimestamp, gravatarURL } from "@app/lib/utils";

  export let header: CommitHeader;
  export let noTime = false;
  export let noAuthor = false;
</script>

<style>
  .authorship {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-6);
  }
  .authorship .author,
  .authorship .committer {
    white-space: nowrap;
  }
  .authorship .avatar {
    width: 1rem;
    height: 1rem;
    border-radius: var(--border-radius-round);
  }

  @media (max-width: 720px) {
    .authorship {
      display: none;
    }
  }
</style>

<span class="authorship txt-tiny">
  {#if header.author.email === header.committer.email}
    <img
      class="avatar"
      alt="avatar"
      src={gravatarURL(header.committer.email)} />
    <span class="layout-desktop-inline committer">
      {header.committer.name}
    </span>
    <span>committed</span>
  {:else}
    {#if !noAuthor}
      <img class="avatar" alt="avatar" src={gravatarURL(header.author.email)} />
      <span class="layout-desktop-inline author">
        {header.author.name}
      </span>
      <span>authored</span>
    {/if}
    <img
      class="avatar"
      alt="avatar"
      src={gravatarURL(header.committer.email)} />
    <span class="layout-desktop-inline committer">
      {header.committer.name}
    </span>
    <span>committed</span>
  {/if}
  {#if !noTime}
    <span class="layout-desktop-inline">
      {formatTimestamp(header.committer.time)}
    </span>
  {/if}
</span>
