<script lang="ts">
  import type { CommitMetadata } from "@app/commit";
  import { formatTimestamp, gravatarURL } from "@app/utils";

  export let commit: CommitMetadata;
  export let showTime = true;
  export let showAuthor = true;
</script>

<style>
  .authorship {
    display: flex;
    align-items: center;
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
    margin-right: 0.25rem;
  }
  .authorship .avatar:not(:first-child) {
    margin-left: 0.125rem;
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
      <span class="txt-bold committer verified-committer">
        {commit.context?.committer.peer.person.name}
      </span>
      <span>&nbsp;committed</span>
    {:else}
      <span class="desktop-inline committer">
        {commit.header.committer.name}
      </span>
      <span>&nbsp;committed</span>
    {/if}
  {:else}
    {#if showAuthor}
      <img
        class="avatar"
        alt="avatar"
        src={gravatarURL(commit.header.author.email)} />
      <span class="desktop-inline author">{commit.header.author.name}</span>
      <span>&nbsp;authored&nbsp;</span>
    {/if}
    <img
      class="avatar"
      alt="avatar"
      src={gravatarURL(commit.header.committer.email)} />
    {#if commit.context?.committer}
      <span class="txt-bold committer verified-committer">
        {commit.context?.committer.peer.person.name}
      </span>
      <span>&nbsp;committed</span>
    {:else}
      <span class="desktop-inline committer">
        {commit.header.committer.name}
      </span>
      <span>&nbsp;committed</span>
    {/if}
  {/if}
  {#if showTime}
    <span>&nbsp;</span>
    <span class="desktop-inline txt-tiny time">
      {formatTimestamp(commit.header.committer.time)}
    </span>
  {/if}
</span>
