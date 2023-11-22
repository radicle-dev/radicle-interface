<script lang="ts" context="module">
  import type { Comment } from "@httpd-client";
  import { groupReactions } from "@app/lib/reactions";

  function groupReactionsInThread(thread: {
    root: Comment;
    replies: Comment[];
  }) {
    return {
      root: {
        ...thread.root,
        reactions: groupReactions(thread.root.reactions),
      },
      replies: thread.replies.map(reply => ({
        ...reply,
        reactions: groupReactions(reply.reactions),
      })),
    };
  }
</script>

<script lang="ts" strictEvents>
  import type { Embed } from "@app/lib/file";

  import * as utils from "@app/lib/utils";
  import { partial } from "lodash";
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
  export let handleReaction:
    | ((commentId: string, nids: string[], reaction: string) => Promise<void>)
    | undefined;

  async function toggleReply() {
    // This tick allows the DOM to update before scrolling.
    await tick();
    utils.scrollIntoView(`reply-${root.id}`, {
      behavior: "smooth",
      block: "center",
    });
  }

  $: threadWithReactions = groupReactionsInThread(thread);
  $: root = threadWithReactions.root;
  $: replies = threadWithReactions.replies;
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
    margin-left: 1rem;
  }
  .reply {
    padding: 1rem;
  }
</style>

<div class="comments">
  <div class="top-level-comment" class:has-replies={replies.length > 0}>
    <CommentComponent
      {rawPath}
      id={root.id}
      authorId={root.author.id}
      authorAlias={root.author.alias}
      reactions={root.reactions}
      timestamp={root.timestamp}
      disableEdit={root.embeds.length > 0}
      body={root.body}
      editComment={editComment &&
        canEditComment(root.author.id) &&
        partial(editComment, root.id)}
      handleReaction={handleReaction && partial(handleReaction, root.id)}>
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
          editComment={editComment &&
            canEditComment(reply.author.id) &&
            partial(editComment, reply.id)}
          handleReaction={handleReaction &&
            partial(handleReaction, reply.id)} />
      {/each}
    </div>
  {/if}
  {#if createReply}
    <div id={`reply-${root.id}`} class="reply">
      <CommentToggleInput
        inline
        placeholder="Reply to comment"
        on:click={toggleReply}
        {enableAttachments}
        submit={partial(createReply, root.id)} />
    </div>
  {/if}
</div>
