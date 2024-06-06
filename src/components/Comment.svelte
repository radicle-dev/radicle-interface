<script lang="ts" strictEvents>
  import type { Comment, Embed } from "@http-client";

  import { tick } from "svelte";

  import { closeFocused } from "./Popover.svelte";
  import * as utils from "@app/lib/utils";

  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";

  export let id: string | undefined = undefined;
  export let authorId: string;
  export let authorAlias: string | undefined = undefined;
  export let body: string;
  export let enableAttachments: boolean = false;
  export let reactions: Comment["reactions"] | undefined = undefined;
  export let embeds: Map<string, Embed> | undefined = undefined;
  export let caption = "commented";
  export let rawPath: string;
  export let timestamp: number;
  export let isReply: boolean = false;
  export let isLastReply: boolean = false;
  export let lastEdit: Comment["edits"][0] | undefined = undefined;

  let state: "read" | "edit" | "submit" = "read";

  export let editComment:
    | ((body: string, embeds: Embed[]) => Promise<void>)
    | undefined = undefined;
  export let reactOnComment:
    | ((
        authors: Comment["reactions"][0]["authors"],
        reaction: string,
      ) => Promise<void>)
    | undefined = undefined;
</script>

<style>
  .card {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;
    gap: 0.5rem;
  }
  .card:not(:last-child) {
    box-shadow: -1px 0 0 0 var(--color-fill-separator);
  }
  .card-header {
    display: flex;
    align-items: center;
    white-space: nowrap;
    flex-wrap: wrap;
    padding: 0 0.75rem;
    min-height: 1.5rem;
    gap: 0.5rem;
    font-size: var(--font-size-small);
  }
  .reply-dot {
    border-radius: var(--border-radius-round);
    width: 4px;
    height: 4px;
    position: absolute;
    top: 10px;
    left: -2.5px;
    background-color: var(--color-fill-separator);
  }
  .icon {
    color: var(--color-fill-gray);
  }
  .card-metadata {
    color: var(--color-fill-gray);
    font-size: var(--font-size-small);
  }
  .header-right {
    display: flex;
    margin-left: auto;
    gap: 0.5rem;
  }
  .card-body {
    display: flex;
    align-items: center;
    min-height: 1.625rem;
    word-wrap: break-word;
    font-size: var(--font-size-small);
    padding: 0 2.25rem;
  }
  .card-empty-body {
    padding: 0;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding-left: 2.25rem;
    margin-left: -0.375rem;
  }
  .timestamp {
    font-size: var(--font-size-small);
    color: var(--color-fill-gray);
  }
  .card-header-no-icon {
    padding-left: 1rem;
  }
  .edit-buttons {
    display: flex;
    gap: 0.25rem;
  }
  .reply .card-body,
  .reply .actions {
    padding-left: 1rem;
  }
  .connector-line {
    width: 1px;
    height: 21px;
    position: absolute;
    top: -9px;
    left: -1px;
    background-color: var(--color-fill-separator);
  }
</style>

<div class="card" class:card-empty-body={!body} {id} class:reply={isReply}>
  <div style:position="relative">
    {#if isReply}
      <div class="reply-dot" />
    {/if}
    {#if isLastReply}
      <div class="connector-line" />
    {/if}
    <div class="card-header" class:card-header-no-icon={isReply}>
      <slot class="icon" name="icon" />
      <NodeId
        stylePopoverPositionLeft="-13px"
        nodeId={authorId}
        alias={authorAlias} />
      <slot name="caption">{caption}</slot>
      {#if id}
        <span class="global-oid">
          {utils.formatObjectId(id)}
        </span>
      {/if}
      <span class="timestamp" title={utils.absoluteTimestamp(timestamp)}>
        {utils.formatTimestamp(timestamp)}
      </span>
      {#if lastEdit}
        <div
          class="card-metadata"
          title={utils.formatEditedCaption(
            lastEdit.author,
            lastEdit.timestamp,
          )}>
          • edited
        </div>
      {/if}
      <div class="header-right">
        {#if id && editComment && state === "read"}
          <div class="edit-buttons global-hide-on-mobile-down">
            <IconButton title="edit comment" on:click={() => (state = "edit")}>
              <IconSmall name={"edit"} />
            </IconButton>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if body}
    <div class="card-body">
      {#if editComment && state !== "read"}
        {@const editComment_ = editComment}
        <ExtendedTextarea
          {rawPath}
          {body}
          {embeds}
          {enableAttachments}
          submitInProgress={state === "submit"}
          submitCaption="Save"
          placeholder="Leave your comment"
          on:submit={async ({ detail: { comment, embeds } }) => {
            state = "submit";
            try {
              await editComment_(comment, Array.from(embeds.values()));
            } finally {
              state = "read";
            }
          }}
          on:close={async () => {
            body = body;
            await tick();
            state = "read";
          }} />
      {:else}
        <div style:overflow="hidden" style:width="100%">
          <Markdown breaks {rawPath} content={body} />
        </div>
      {/if}
    </div>
  {/if}
  {#if (id && reactOnComment) || (id && reactions && reactions.length > 0)}
    <div class="actions">
      {#if id && reactOnComment}
        {@const reactOnComment_ = reactOnComment}
        <div class="global-hide-on-mobile-down">
          <ReactionSelector
            {reactions}
            on:select={async ({ detail: { authors, emoji } }) => {
              try {
                await reactOnComment_(authors, emoji);
              } finally {
                closeFocused();
              }
            }} />
        </div>
      {/if}
      {#if id && reactions && reactions.length > 0}
        <Reactions handleReaction={reactOnComment} {reactions} />
      {/if}
    </div>
  {/if}
</div>
