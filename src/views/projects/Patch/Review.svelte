<script lang="ts">
  import type { Review } from "@app/lib/patch";
  import type { Blob } from "@app/lib/project";

  import Authorship from "@app/components/Authorship.svelte";
  import Comment from "@app/components/Comment.svelte";
  import { formatVerdict } from "@app/lib/patch";

  export let review: Review;
  export let getImage: (path: string) => Promise<Blob>;
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
      author={review.author}
      timestamp={review.timestamp}
      caption={formatVerdict(review.verdict)} />
  </div>
{/if}
