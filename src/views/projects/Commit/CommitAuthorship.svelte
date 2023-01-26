<script lang="ts">
  import type { CommitMetadata } from "@app/lib/commit";

  import Badge from "@app/components/Badge.svelte";
  import { formatTimestamp, gravatarURL } from "@app/lib/utils";

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
  {#if commit.commit.author.email === commit.commit.committer.email}
    <img
      class="avatar"
      alt="avatar"
      src={gravatarURL(commit.commit.committer.email)} />
    {#if commit.context?.committer}
      <span
        class="committer"
        class:txt-bold={Boolean(commit.context.committer.peer.person?.name)}>
        {commit.context.committer.peer.person?.name ||
          commit.commit.committer.name}
      </span>
      {#if !noDelegate && commit.context?.committer.peer.delegate}
        <Badge variant="tertiary">delegate</Badge>
      {/if}
      <span>committed</span>
    {:else}
      <span class="layout-desktop-inline committer">
        {commit.commit.committer.name}
      </span>
      <span>committed</span>
    {/if}
  {:else}
    {#if !noAuthor}
      <img
        class="avatar"
        alt="avatar"
        src={gravatarURL(commit.commit.author.email)} />
      <span class="layout-desktop-inline author">
        {commit.commit.author.name}
      </span>
      <span>authored</span>
    {/if}
    <img
      class="avatar"
      alt="avatar"
      src={gravatarURL(commit.commit.committer.email)} />
    {#if commit.context?.committer}
      <span
        class="committer"
        class:txt-bold={Boolean(commit.context.committer.peer.person?.name)}>
        {commit.context.committer.peer.person?.name ||
          commit.commit.committer.name}
      </span>
      {#if !noDelegate && commit.context?.committer.peer.delegate}
        <Badge variant="tertiary">delegate</Badge>
      {/if}
      <span>committed</span>
    {:else}
      <span class="layout-desktop-inline committer">
        {commit.commit.committer.name}
      </span>
      <span>committed</span>
    {/if}
  {/if}
  {#if !noTime}
    <span class="layout-desktop-inline">
      {formatTimestamp(commit.commit.committer.time)}
    </span>
  {/if}
</span>
