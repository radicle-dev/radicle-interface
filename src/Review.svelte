<script lang="ts">
  import { onMount } from "svelte";
  import type { Config } from "@app/config";
  import { formatVerdict, Review } from "@app/patch";
  import type { Blob } from "@app/project";
  import { Profile, ProfileType } from "@app/profile";
  import Authorship from "@app/Authorship.svelte";

  import Comment from "@app/Comment.svelte";

  export let review: Review;
  export let config: Config;
  export let getImage: (path: string) => Promise<Blob>;

  let profile: Profile | null = null;

  onMount(async () => {
    if (review.author.profile?.ens?.name) {
      profile = await Profile.get(
        review.author.profile.ens.name,
        ProfileType.Minimal,
        config,
      );
    }
  });
</script>

<style>
  div {
    margin: 0 0 1rem 3rem;
  }
</style>

{#if review.comment.body}
  <Comment
    {config}
    {getImage}
    comment={review.comment}
    caption={formatVerdict(review.verdict)} />
{:else}
  <div>
    <Authorship
      {config}
      {profile}
      author={review.author}
      timestamp={review.timestamp}
      caption={formatVerdict(review.verdict)} />
  </div>
{/if}
