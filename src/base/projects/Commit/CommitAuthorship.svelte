<script lang="ts">
  import type { CommitMetadata } from "@app/commit";

  import Badge from "@app/Badge.svelte";
  import { formatSeedId, formatTimestamp, gravatarURL } from "@app/utils";

  export let commit: CommitMetadata;
  export let noTime = false;
  export let noAuthor = false;
  export let noDelegate = false;
</script>

<style>
  .authorship {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-5);
    padding: 0.125rem 0;
  }
  .authorship .author,
  .authorship .committer {
    color: var(--color-foreground);
    white-space: nowrap;
  }
  .authorship .avatar {
    width: 1rem;
    height: 1rem;
    border-radius: var(--border-radius);
  }

  @media (max-width: 720px) {
    .authorship {
      display: none;
    }
  }
</style>

<span class="authorship txt-tiny">
  {#if commit.header.author.email === commit.header.committer.email}
    <img
      class="avatar"
      alt="avatar"
      src={gravatarURL(commit.header.committer.email)} />
    {#if commit.context?.committer}
      <span class="txt-bold committer">
        {commit.context.committer.peer.person?.name ||
          formatSeedId(commit.context.committer.peer.id)}
      </span>
      {#if !noDelegate && commit.context.committer.peer.delegate}
        <Badge variant="tertiary">delegate</Badge>
      {/if}
      <span>committed</span>
    {:else}
      <span class="desktop-inline committer">
        {commit.header.committer.name}
      </span>
      <span>committed</span>
    {/if}
  {:else}
    {#if !noAuthor}
      <img
        class="avatar"
        alt="avatar"
        src={gravatarURL(commit.header.author.email)} />
      <span class="desktop-inline author">{commit.header.author.name}</span>
      <span>authored</span>
    {/if}
    <img
      class="avatar"
      alt="avatar"
      src={gravatarURL(commit.header.committer.email)} />
    {#if commit.context?.committer}
      <span class="txt-bold committer">
        {commit.context?.committer.peer.person.name}
      </span>
      {#if !noDelegate && commit.context?.committer.peer.delegate}
        <Badge variant="tertiary">delegate</Badge>
      {/if}
      <span>committed</span>
    {:else}
      <span class="desktop-inline committer">
        {commit.header.committer.name}
      </span>
      <span>committed</span>
    {/if}
  {/if}
  {#if !noTime}
    <span class="desktop-inline">
      {formatTimestamp(commit.header.committerTime)}
    </span>
  {/if}
</span>
