<script lang="ts">
  import { onMount } from "svelte";
  import { formatObjectId } from "@app/cobs";
  import type { Patch } from "@app/patch";
  import type { Config } from "@app/config";
  import { Profile, ProfileType } from "@app/profile";

  import Authorship from "@app/Authorship.svelte";

  export let patch: Patch;
  export let config: Config;

  let profile: Profile | null = null;

  onMount(async () => {
    if (patch.author.profile?.ens?.name) {
      profile = await Profile.get(
        patch.author.profile.ens.name,
        ProfileType.Minimal,
        config,
      );
    }
  });

  const commentCount = patch.countComments(patch.revisions.length - 1);
</script>

<style>
  .patch-teaser {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-foreground-background);
    padding: 0.75rem 0;
  }
  .patch-teaser:hover {
    background-color: var(--color-foreground-background-lighter);
    cursor: pointer;
  }
  .patch-id {
    color: var(--color-foreground-faded);
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
    margin-left: 0.5rem;
  }

  .column-left {
    flex: min-content;
  }
  .column-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 1rem;
    flex-basis: 5rem;
  }
  .comment-count {
    color: var(--color-foreground-70);
    font-weight: bold;
  }
  .comment-count .emoji {
    margin-right: 0.25rem;
  }

  .state {
    padding: 0 1rem;
  }
  .state-icon {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 0.5rem;
  }
  .open {
    background-color: var(--color-positive);
  }
  .closed {
    background-color: var(--color-negative-2);
  }
  .summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 1rem;
  }

  @media (max-width: 720px) {
    .column-left {
      overflow: hidden;
    }
    .summary {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 1rem;
    }
  }
</style>

<div class="patch-teaser">
  <div class="state">
    <div
      class="state-icon"
      class:closed={patch.state === "archived"}
      class:open={patch.state === "proposed"} />
  </div>
  <div class="column-left">
    <div class="summary">
      <!-- TODO: Truncation not working on overflow -->
      {patch.title}
      <span class="patch-id">{formatObjectId(patch.id)}</span>
    </div>
    <Authorship
      {profile}
      {config}
      caption="opened"
      author={patch.author}
      timestamp={patch.timestamp} />
  </div>
  {#if commentCount > 0}
    <div class="column-right">
      <div class="comment-count">
        <span class="text-xsmall emoji">💬</span>
        <span>{commentCount}</span>
      </div>
    </div>
  {/if}
</div>
