<script lang="ts" strictEvents>
  import type { Embed } from "@app/lib/file";

  import { createEventDispatcher, tick } from "svelte";

  import { authenticated } from "@app/lib/httpd";
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
  export let reactions: [string, string][];
  export let caption = "commented";
  export let rawPath: string;
  export let timestamp: number;
  export let isReply: boolean = false;
  export let isLastReply: boolean = false;
  //  TODO: Remove flag once `radicle-httpd` fixes embed editing
  export let disableEdit: boolean = false;

  let editInProgress = false;

  const dispatch = createEventDispatcher<{
    react: { nids: string[]; id: string; reaction: string };
    edit: { comment: string; embeds: Embed[] };
  }>();

  $: groupedReactions = reactions?.reduce(
    (acc, [nid, emoji]) => acc.set(emoji, [...(acc.get(emoji) ?? []), nid]),
    new Map<string, string[]>(),
  );
</script>

<style>
  .card {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    gap: 0.5rem;
  }
  .card:not(:last-child) {
    box-shadow: -1px 0 0 0 var(--color-fill-separator);
  }
  .card-header {
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    height: 1.5rem;
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
  .timestamp {
    color: var(--color-fill-gray);
    font-size: var(--font-size-small);
  }
  .header-right {
    display: flex;
    margin-left: auto;
    gap: 0.5rem;
  }
  .card-body {
    word-wrap: break-word;
    font-size: var(--font-size-small);
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding-left: 2rem;
    height: 22px;
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
    height: 28px;
    position: absolute;
    top: -16px;
    left: -1px;
    background-color: var(--color-fill-separator);
  }
</style>

<div class="card" {id} class:reply={isReply}>
  <div style:position="relative">
    {#if isReply}
      <div class="reply-dot" />
    {/if}
    {#if isLastReply}
      <div class="connector-line" />
    {/if}
    <div class="card-header">
      <div class="icon">
        <slot name="icon" />
      </div>
      <NodeId nodeId={authorId} alias={authorAlias} />
      {caption}
      <div class="header-right">
        {#if id && $authenticated && !editInProgress && !disableEdit}
          <div class="edit-buttons">
            <IconButton
              title="edit comment"
              on:click={() => (editInProgress = true)}>
              <IconSmall name={"edit"} />
            </IconButton>
          </div>
        {/if}
        <div class="timestamp" title={utils.absoluteTimestamp(timestamp)}>
          {utils.formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  </div>

  <div class="card-body">
    {#if editInProgress}
      <ExtendedTextarea
        {body}
        {enableAttachments}
        submitCaption="Save"
        placeholder="Leave your description"
        on:submit={({ detail: { comment, embeds } }) => {
          editInProgress = false;
          dispatch("edit", { comment, embeds });
        }}
        on:close={async () => {
          body = body;
          await tick();
          editInProgress = false;
        }} />
    {:else if body.trim() === ""}
      <span class="txt-missing">No description</span>
    {:else}
      <Markdown {rawPath} content={body} />
    {/if}
  </div>
  {#if (id && $authenticated) || (id && groupedReactions.size > 0)}
    <div class="actions">
      {#if id && $authenticated}
        <ReactionSelector
          nid={$authenticated.session.publicKey}
          reactions={groupedReactions}
          on:select={event => {
            if (id) {
              dispatch("react", { id, ...event.detail });
            }
          }} />
      {/if}
      {#if id && groupedReactions.size > 0}
        <Reactions
          clickable={Boolean($authenticated)}
          reactions={groupedReactions}
          on:remove={event => {
            if (id) {
              dispatch("react", { id, ...event.detail });
            }
          }} />
      {/if}
    </div>
  {/if}
</div>
