<script lang="ts">
  import type { Comment } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import CommentComponent from "@app/components/Comment.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import { createEventDispatcher, tick } from "svelte";
  import { scrollIntoView } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";

  export let thread: { root: Comment; replies: Comment[] };
  export let rawPath: string;
  export let isDescription = false;
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
    cancel: never;
  }>();

  $: root = thread.root;
  $: replies = thread.replies;
</script>

<style>
  .reply {
    margin-left: 3rem;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-bottom: 1rem;
  }
</style>

<CommentComponent
  {rawPath}
  id={root.id}
  nodeId={root.author.id}
  timestamp={root.timestamp}
  body={root.body}
  showReplyIcon={Boolean($sessionStore) && !isDescription}
  on:toggleReply={toggleReply} />
{#each replies as reply}
  <div class="reply">
    <CommentComponent
      {rawPath}
      id={reply.id}
      nodeId={reply.author.id}
      timestamp={reply.timestamp}
      body={reply.body} />
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
      <Button variant="text" size="small" on:click={cancel}>Dismiss</Button>
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
