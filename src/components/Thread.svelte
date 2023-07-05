<script lang="ts" strictEvents>
  import type { BaseUrl } from "@httpd-client";
  import type { Comment } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import CommentComponent from "@app/components/Comment.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import { createEventDispatcher, tick } from "svelte";
  import { scrollIntoView } from "@app/lib/utils";
  import { httpdStore } from "@app/lib/httpd";

  export let baseUrl: BaseUrl;
  export let projectId: string;
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
      {projectId}
      {baseUrl}
      {rawPath}
      id={root.id}
      authorId={root.author.id}
      authorAlias={root.author.alias}
      timestamp={root.timestamp}
      body={root.body}
      showReplyIcon={Boolean($httpdStore.state === "authenticated")}
      on:toggleReply={toggleReply} />
  </div>
  {#each replies as reply}
    <div class="comment reply">
      <CommentComponent
        {projectId}
        {baseUrl}
        {rawPath}
        id={reply.id}
        authorId={reply.author.id}
        authorAlias={reply.author.alias}
        caption="replied"
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
</div>
