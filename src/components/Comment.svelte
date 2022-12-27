<script lang="ts">
  import type { Blob } from "@app/lib/project";
  import type { Comment, Thread } from "@app/lib/issue";
  import type { Wallet } from "@app/lib/wallet";

  import { onMount } from "svelte";

  import Authorship from "@app/components/Authorship.svelte";
  import Avatar from "@app/components/Avatar.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import ReactionSelector from "./Comment/ReactionSelector.svelte";
  import Reactions from "./Comment/Reactions.svelte";

  import { Profile, ProfileType } from "@app/lib/profile";

  export let comment: Comment | Thread;
  export let wallet: Wallet;
  export let caption = "left a comment";
  export let getImage: (path: string) => Promise<Blob>;

  let profile: Profile | null = null;

  onMount(async () => {
    if (comment.author.profile?.ens?.name) {
      profile = await Profile.get(
        comment.author.profile.ens.name,
        ProfileType.Minimal,
        wallet,
      );
    }
  });

  const templateComment = `<!--
Please enter a comment message for your patch update. Leaving this
blank is also okay.
-->`;

  $: source = profile?.avatar || comment.author.id;
  $: title =
    profile?.name ||
    (comment.author.profile ? comment.author.profile.name : comment.author.id);

  const selectReaction = (event: { detail: string }) => {
    // TODO: Once we allow adding reactions through the http-api, we should call it here.
    console.debug(event.detail);
  };

  const incrementReaction = (event: { detail: string }) => {
    // TODO: Once we allow increment reactions through the http-api, we should call it here.
    console.debug(event.detail);
  };
</script>

<style>
  .comment {
    margin-bottom: 1rem;
    display: flex;
  }
  .person {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
  }
  .card {
    flex: 1;
    border: 1px solid var(--color-foreground-4);
    border-radius: var(--border-radius);
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }
  .card-body {
    font-size: var(--font-size-small);
    padding: 0rem 1rem 1rem 1rem;
  }
  .reactions {
    display: flex;
    margin-top: 1rem;
  }
</style>

<div class="comment">
  <div class="person">
    <Avatar {source} {title} />
  </div>
  <div class="card">
    <div class="card-header">
      <Authorship
        noAvatar
        {wallet}
        {caption}
        {profile}
        author={comment.author}
        timestamp={comment.timestamp} />
      <ReactionSelector on:select={selectReaction} />
    </div>
    <div class="card-body">
      {#if comment.body.trim() === "" || comment.body.trim() === templateComment}
        <span class="txt-missing">No description.</span>
      {:else}
        <Markdown content={comment.body} {getImage} />
      {/if}
      {#if comment.reactions.length > 0}
        <div class="reactions">
          <Reactions
            reactions={comment.reactions}
            on:click={incrementReaction} />
        </div>
      {/if}
    </div>
  </div>
</div>
