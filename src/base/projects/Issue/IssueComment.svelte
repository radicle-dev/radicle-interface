<script lang="ts">
  import { onMount } from "svelte";
  import type { Config } from "@app/config";
  import type { Comment } from "@app/issue";
  import Avatar from "@app/Avatar.svelte";
  import Markdown from "@app/Markdown.svelte";
  import ReactionSelector from "@app/ReactionSelector.svelte";
  import type { Blob } from "@app/project";
  import { Profile, ProfileType } from "@app/profile";

  import IssueAuthorship from "./IssueAuthorship.svelte";
  import Reactions from "./Reactions.svelte";

  export let comment: Comment;
  export let config: Config;
  export let getImage: (path: string) => Promise<Blob>;

  let profile: Profile | null = null;

  onMount(async () => {
    if (comment.author.ens?.name) {
      profile = await Profile.get(comment.author.ens.name, ProfileType.Minimal, config);
    }
  });

  const selectReaction = (event: { detail: string }) => {
    // TODO: Once we allow adding reactions through the http-api, we should call it here.
    console.log(event.detail);
  };

  const incrementReaction = (event: { detail: string }) => {
    // TODO: Once we allow increment reactions through the http-api, we should call it here.
    console.log(event.detail);
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
    border: 1px solid var(--color-foreground-3);
    border-radius: var(--border-radius-medium);
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }
  .card-body {
    font-size: 0.875rem;
    padding: 0rem 1rem 1rem 1rem;
  }
  .reactions {
    display: flex;
    margin-top: 1rem;
  }
</style>

<div class="comment">
  <div class="person">
    <Avatar source={profile?.avatar || comment.author.urn} title={profile?.name || comment.author.urn} />
  </div>
  <div class="card">
    <div class="card-header">
      <IssueAuthorship noAvatar {config}
        caption="commented on" author={comment.author} {profile} timestamp={comment.timestamp} />
      <ReactionSelector on:select={selectReaction} />
    </div>
    <div class="card-body">
      <Markdown content={comment.body} {getImage} />
      {#if comment.reactions.length > 0}
        <div class="reactions">
          <Reactions reactions={comment.reactions} on:click={incrementReaction} />
        </div>
      {/if}
    </div>
  </div>
</div>
