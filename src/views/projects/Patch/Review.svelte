<script lang="ts">
  import type { Blob } from "@app/lib/project";
  import type { Review } from "@app/lib/patch";

  import Authorship from "@app/components/Authorship.svelte";
  import Comment from "@app/components/Comment.svelte";
  import { Profile, ProfileType } from "@app/lib/profile";
  import { formatVerdict } from "@app/lib/patch";
  import { onMount } from "svelte";

  export let review: Review;
  export let getImage: (path: string) => Promise<Blob>;

  let profile: Profile | null = null;

  onMount(async () => {
    if (review.author.profile?.ens?.name) {
      profile = await Profile.get(
        review.author.profile.ens.name,
        ProfileType.Minimal,
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
    {getImage}
    comment={review.comment}
    caption={formatVerdict(review.verdict)} />
{:else}
  <div>
    <Authorship
      {profile}
      author={review.author}
      timestamp={review.timestamp}
      caption={formatVerdict(review.verdict)} />
  </div>
{/if}
