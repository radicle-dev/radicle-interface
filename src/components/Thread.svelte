<script lang="ts" strictEvents>
  import type { Comment } from "@httpd-client";

  import { createEventDispatcher, tick } from "svelte";
  import { httpdStore } from "@app/lib/httpd";
  import { scrollIntoView } from "@app/lib/utils";

  import CommentComponent from "@app/components/Comment.svelte";
  import Button from "@app/components/Button.svelte";
  import Textarea from "@app/components/Textarea.svelte";

  export let thread: { root: Comment; replies: Comment[] };
  export let rawPath: string;
  export let showReplyTextarea = false;

  let replyText = "";

  function cancel() {
    showReplyTextarea = false;
    scrollIntoView(root.id, {
      behavior: "smooth",
      block: "center",
    });
  }

  async function toggleReply() {
    replyText = "";
    showReplyTextarea = !showReplyTextarea;
    // This tick allows the DOM to update before scrolling.
    await tick();
    if (showReplyTextarea) {
      scrollIntoView(`reply-${root.id}`, {
        behavior: "smooth",
        block: "center",
      });
    }
  }

  function reply() {
    dispatch("reply", { id: root.id, body: replyText });
    showReplyTextarea = false;
  }

  const dispatch = createEventDispatcher<{
    reply: { id: string; body: string };
    react: { nids: string[]; commentId: string | undefined; reaction: string };
    cancel: never;
  }>();

  $: root = thread.root;
  $: replies = thread.replies;
</script>

<style>
  .comments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .comment {
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius-small);
  }
  .reply {
    margin-left: 1.5rem;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-bottom: 1rem;
  }
</style>

<div class="comments">
  <div class="comment">
    <CommentComponent
      {rawPath}
      id={root.id}
      authorId={root.author.id}
      authorAlias={root.author.alias}
      reactions={root.reactions}
      timestamp={root.timestamp}
      body={root.body}
      showReplyIcon={Boolean($httpdStore.state === "authenticated")}
      on:toggleReply={toggleReply}
      on:react />
  </div>
  {#each replies as reply}
    <div class="comment reply">
      <CommentComponent
        {rawPath}
        id={reply.id}
        authorId={reply.author.id}
        authorAlias={reply.author.alias}
        caption="replied"
        reactions={reply.reactions}
        timestamp={reply.timestamp}
        body={reply.body}
        on:react />
    </div>
  {/each}
  {#if showReplyTextarea}
    <div id={`reply-${root.id}`} class="reply">
      <Textarea
        resizable
        focus={showReplyTextarea}
        bind:value={replyText}
        on:submit={reply}
        placeholder="Leave your reply" />
      <div class="actions">
        <Button variant="none" size="small" on:click={cancel}>Dismiss</Button>
        <Button
          variant="secondary"
          size="small"
          disabled={!replyText}
          on:click={reply}>
          Reply
        </Button>
      </div>
    </div>
  {/if}
</div>
