<script lang="ts">
  import type * as cobs from "@app/lib/cobs";

  import Button from "@app/components/Button.svelte";
  import Comment from "@app/components/Comment.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import { createEventDispatcher, tick } from "svelte";
  import { scrollIntoView } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";

  export let thread: { root: cobs.Comment; replies: cobs.Comment[] };
  export let rawPath: string;
  export let isDescription = false;
  export let showReplyTextarea = false;

  const allowReply = Boolean($sessionStore) && !isDescription;
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

<Comment
  {rawPath}
  id={root.id}
  author={root.author}
  timestamp={root.timestamp}
  body={root.body}
  icon={allowReply ? "chat" : undefined}
  actionText={allowReply ? "reply" : undefined}
  on:toggle={toggleReply} />
{#each replies as reply}
  <div class="reply">
    <Comment
      {rawPath}
      id={reply.id}
      author={reply.author}
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
