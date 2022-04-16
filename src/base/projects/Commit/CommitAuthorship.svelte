<script lang="ts">
  import type { CommitMetadata } from "@app/commit";
  import { gravatarURL } from "@app/utils";
  import { formatCommitTime } from "@app/commit";

  export let commit: CommitMetadata;
</script>

<style>
  .authorship {
    display: flex;
    align-items: center;
    color: var(--color-foreground-faded);
    padding: 0.125rem 0;
  }
  .authorship .author, .authorship .committer {
    color: var(--color-foreground);
    white-space: nowrap;
  }
  .authorship .avatar {
    width: 1rem;
    height: 1rem;
    border-radius: 0.5rem;
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

<span class="authorship text-xsmall">
  <img class="avatar" alt="avatar" src="{gravatarURL(commit.header.author.email)}" />
  {#if commit.header.author.email === commit.header.committer.email}
    {#if commit.context?.committer}
      <span class="bold committer verified-committer">
        {commit.context?.committer.peer.person.name}
      </span>
      <span>&nbsp;committed</span>
    {:else}
      <span class="desktop-inline committer">{commit.header.committer.name}</span>
      <span>&nbsp;committed</span>
    {/if}
  {:else}
    <span class="desktop-inline author">{commit.header.author.name}</span>
    <span>&nbsp;authored&nbsp;</span>
    <img class="avatar" alt="avatar" src="{gravatarURL(commit.header.committer.email)}" />
    {#if commit.context?.committer}
      <span class="bold committer verified-committer">
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
  <span>&nbsp;at&nbsp;</span>
  <span class="desktop-inline text-xsmall time">{formatCommitTime(commit.header.committerTime)}</span>
</span>
