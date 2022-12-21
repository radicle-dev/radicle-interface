<script lang="ts">
  import { onMount } from "svelte";
  import type { Wallet } from "@app/lib/wallet";
  import type { Review } from "@app/lib/patch";
  import { formatVerdict } from "@app/lib/patch";
  import type { Blob } from "@app/lib/project";
  import { Profile, ProfileType } from "@app/lib/profile";
  import Authorship from "@app/components/Authorship.svelte";

  import Comment from "@app/components/Comment.svelte";

  export let review: Review;
  export let wallet: Wallet;
  export let getImage: (path: string) => Promise<Blob>;

  let profile: Profile | null = null;

  onMount(async () => {
    if (review.author.profile?.ens?.name) {
      profile = await Profile.get(
        review.author.profile.ens.name,
        ProfileType.Minimal,
        wallet,
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
    {wallet}
    {getImage}
    comment={review.comment}
    caption={formatVerdict(review.verdict)} />
{:else}
  <div>
    <Authorship
      {wallet}
      {profile}
      author={review.author}
      timestamp={review.timestamp}
      caption={formatVerdict(review.verdict)} />
  </div>
{/if}
