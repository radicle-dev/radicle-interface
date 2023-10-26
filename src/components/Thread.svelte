<script lang="ts" strictEvents>
  import type { Comment } from "@httpd-client";
  import type { Embed } from "@app/lib/file";

  import { createEventDispatcher, tick } from "svelte";
  import { httpdStore } from "@app/lib/httpd";
  import * as utils from "@app/lib/utils";

  import CommentComponent from "@app/components/Comment.svelte";
  import CommentToggleInput from "@app/components/CommentToggleInput.svelte";
  import IconSmall from "./IconSmall.svelte";

  export let thread: { root: Comment; replies: Comment[] };
  export let rawPath: string;
  export let enableAttachments: boolean = false;

  async function toggleReply() {
    // This tick allows the DOM to update before scrolling.
    await tick();
    utils.scrollIntoView(`reply-${root.id}`, {
      behavior: "smooth",
      block: "center",
    });
  }

  const dispatch = createEventDispatcher<{
    reply: {
      id: string;
      embeds: Embed[];
      body: string;
    };
    editComment: { id: string; body: string; embeds: Embed[] };
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
    box-shadow: 0 0 0 1px var(--color-border-hint);
    border-radius: var(--border-radius-small);
  }
  .top-level-comment {
    background-color: var(--color-background-float);
    border-bottom: 1px solid var(--color-fill-separator);
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }
  .replies {
    margin-left: 1rem;
  }
  .reply {
    padding: 1rem;
  }
</style>

<div class="comments">
  <div
    class="top-level-comment"
    style:border-bottom={replies.length > 0
      ? "1px solid var(--color-fill-separator)"
      : undefined}>
    <CommentComponent
      {rawPath}
      id={root.id}
      authorId={root.author.id}
      authorAlias={root.author.alias}
      reactions={root.reactions}
      timestamp={root.timestamp}
      disableEdit={root.embeds.length > 0}
      body={root.body}
      on:edit={({ detail }) =>
        dispatch("editComment", {
          id: root.id,
          body: detail.comment,
          embeds: detail.embeds,
        })}
      on:react>
      <IconSmall name="chat" slot="icon" />
    </CommentComponent>
  </div>
  {#if replies.length > 0}
    <div class="replies">
      {#each replies as reply}
        <CommentComponent
          {rawPath}
          id={reply.id}
          authorId={reply.author.id}
          authorAlias={reply.author.alias}
          caption="replied"
          isReply
          isLastReply={replies[replies.length - 1] === reply}
          reactions={reply.reactions}
          timestamp={reply.timestamp}
          disableEdit={reply.embeds.length > 0}
          body={reply.body}
          on:edit={({ detail }) =>
            dispatch("editComment", {
              id: reply.id,
              body: detail.comment,
              embeds: detail.embeds,
            })}
          on:react />
      {/each}
    </div>
  {/if}
  {#if $httpdStore.state === "authenticated"}
    <div id={`reply-${root.id}`} class="reply">
      <CommentToggleInput
        inline
        placeholder="Reply to comment"
        on:click={toggleReply}
        {enableAttachments}
        on:submit={async event => {
          dispatch("reply", {
            id: root.id,
            embeds: event.detail.embeds,
            body: event.detail.comment,
          });
        }} />
    </div>
  {/if}
</div>
