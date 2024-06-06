<script lang="ts" strictEvents>
  import type { Embed } from "@http-client";
  import type { Comment } from "@http-client";

  import * as utils from "@app/lib/utils";
  import partial from "lodash/partial";
  import { parseEmbedIntoMap } from "@app/lib/file";
  import { tick } from "svelte";

  import CommentComponent from "@app/components/Comment.svelte";
  import CommentToggleInput from "@app/components/CommentToggleInput.svelte";
  import IconSmall from "./IconSmall.svelte";

  export let thread: {
    root: Comment;
    replies: Comment[];
  };
  export let rawPath: string;
  export let enableAttachments: boolean = false;
  export let canEditComment: (author: string) => true | undefined;
  export let editComment:
    | ((commentId: string, body: string, embeds: Embed[]) => Promise<void>)
    | undefined;
  export let createReply:
    | ((commentId: string, comment: string, embeds: Embed[]) => Promise<void>)
    | undefined;
  export let reactOnComment:
    | ((
        commentId: string,
        authors: Comment["reactions"][0]["authors"],
        reaction: string,
      ) => Promise<void>)
    | undefined;

  async function toggleReply() {
    // This tick allows the DOM to update before scrolling.
    await tick();
    utils.scrollIntoView(`reply-${root.id}`, {
      behavior: "smooth",
      block: "center",
    });
  }

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
    border-radius: var(--border-radius-small);
  }
  .has-replies {
    border-bottom: 1px solid var(--color-fill-separator);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .replies {
    margin-left: 1.25rem;
  }
  .reply {
    padding: 1rem;
  }
  @media (max-width: 719.98px) {
    .comments {
      border-radius: 0;
    }
  }
</style>

<div class="comments">
  <div class="top-level-comment" class:has-replies={replies.length > 0}>
    <CommentComponent
      {enableAttachments}
      {rawPath}
      id={root.id}
      lastEdit={root.edits.length > 1 ? root.edits.pop() : undefined}
      authorId={root.author.id}
      authorAlias={root.author.alias}
      reactions={root.reactions}
      embeds={parseEmbedIntoMap(root.embeds)}
      timestamp={root.timestamp}
      body={root.body}
      editComment={editComment &&
        canEditComment(root.author.id) &&
        partial(editComment, root.id)}
      reactOnComment={reactOnComment && partial(reactOnComment, root.id)}>
      <IconSmall name="chat" slot="icon" />
    </CommentComponent>
  </div>
  {#if replies.length > 0}
    <div class="replies">
      {#each replies as reply}
        <CommentComponent
          {enableAttachments}
          {rawPath}
          lastEdit={reply.edits.length > 1 ? reply.edits.pop() : undefined}
          id={reply.id}
          authorId={reply.author.id}
          authorAlias={reply.author.alias}
          caption="replied"
          isReply
          isLastReply={replies[replies.length - 1] === reply}
          reactions={reply.reactions}
          embeds={parseEmbedIntoMap(reply.embeds)}
          timestamp={reply.timestamp}
          body={reply.body}
          editComment={editComment &&
            canEditComment(reply.author.id) &&
            partial(editComment, reply.id)}
          reactOnComment={reactOnComment &&
            partial(reactOnComment, reply.id)} />
      {/each}
    </div>
  {/if}
  {#if createReply}
    <div id={`reply-${root.id}`} class="reply global-hide-on-mobile-down">
      <CommentToggleInput
        {rawPath}
        focus
        inline
        placeholder="Reply to comment"
        on:click={toggleReply}
        {enableAttachments}
        submit={partial(createReply, root.id)} />
    </div>
  {/if}
</div>
