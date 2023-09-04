<script lang="ts" strictEvents>
  import type { Comment } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import CommentComponent from "@app/components/Comment.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import { createEventDispatcher, tick } from "svelte";
  import { scrollIntoView } from "@app/lib/utils";
  import { httpdStore } from "@app/lib/httpd";
  import { embed } from "@app/lib/file";

  export let newEmbeds: { name: string; content: string }[] = [];
  export let selectionStart = 0;
  export let selectionEnd = 0;
  export let thread: { root: Comment; replies: Comment[] };
  export let rawPath: string;
  export let showReplyTextarea = false;

  let replyText = "";

  function handleFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const embeds = Array.from(event.dataTransfer.files).map(embed);
      void Promise.all(embeds).then(embeds =>
        embeds.forEach(embed => {
          newEmbeds.push({ name: embed.name, content: embed.content });
          const embedText = `![${embed.name}](${embed.oid})\n`;
          replyText = replyText
            .slice(0, selectionStart)
            .concat(embedText, replyText.slice(selectionEnd));
          selectionStart += embedText.length;
          selectionEnd = selectionStart;
        }),
      );
    }
  }

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
    dispatch("reply", { id: root.id, embeds: newEmbeds, body: replyText });
    replyText = "";
    newEmbeds = [];
    showReplyTextarea = false;
  }

  const dispatch = createEventDispatcher<{
    reply: {
      id: string;
      embeds: { name: string; content: string }[];
      body: string;
    };
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
        on:drop={handleFileDrop}
        bind:selectionStart
        bind:selectionEnd
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
