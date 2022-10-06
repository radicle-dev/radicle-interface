<script lang="ts">
  import type { Blob } from "@app/project";
  import type { Config } from "@app/config";
  import type { Review } from "@app/patch";

  import { onMount } from "svelte";

  import Authorship from "@app/Authorship.svelte";
  import Comment from "@app/Comment.svelte";
  import { Profile, ProfileType } from "@app/profile";
  import { formatVerdict } from "@app/patch";

  export let config: Config;
  export let getImage: (path: string) => Promise<Blob>;
  export let review: Review;

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
