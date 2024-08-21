<script lang="ts">
  import type { CommitHeader } from "@http-client";

  import {
    absoluteTimestamp,
    formatTimestamp,
    gravatarURL,
  } from "@app/lib/utils";

  export let header: CommitHeader;
</script>

<style>
  .authorship {
    display: flex;
    font-size: var(--font-size-small);
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .person {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    gap: 0.5rem;
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-semibold);
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
    </div>
    committed
    <slot />
    <span title={absoluteTimestamp(header.committer.time)}>
      {formatTimestamp(header.committer.time)}
    </span>
  {:else}
    <div class="person">
      <img class="avatar" alt="avatar" src={gravatarURL(header.author.email)} />
      {header.author.name}
    </div>
    authored and
    <div class="person">
      <img
        class="avatar"
        alt="avatar"
        src={gravatarURL(header.committer.email)} />
      {header.committer.name}
    </div>
    committed
    <slot />
    <span title={absoluteTimestamp(header.committer.time)}>
      {formatTimestamp(header.committer.time)}
    </span>
  {/if}
</span>
