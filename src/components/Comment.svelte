<script lang="ts">
  import type { Comment, Thread } from "@app/lib/issue";

  import Authorship from "@app/components/Authorship.svelte";
  import Avatar from "@app/components/Comment/Avatar.svelte";
  import Markdown from "@app/components/Markdown.svelte";

  export let comment: Comment | Thread;
  export let caption = "commented";
  export let rawPath: string;

  $: source = comment.author.id;
  $: title = comment.author.id;
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
    word-break: break-all;
  }
</style>

<div class="comment">
  <div class="person">
    <Avatar {source} {title} />
  </div>
  <div class="card">
    <div class="card-header">
      <Authorship
        {caption}
        author={comment.author}
        timestamp={comment.timestamp} />
    </div>
    <div class="card-body">
      {#if comment.body.trim() === ""}
        <span class="txt-missing">No description.</span>
      {:else}
        <Markdown {rawPath} content={comment.body} />
      {/if}
    </div>
  </div>
</div>
