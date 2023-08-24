<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import { httpdStore } from "@app/lib/httpd";
  import * as utils from "@app/lib/utils";

  import Markdown from "@app/components/Markdown.svelte";
  import NodeId from "./NodeId.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";
  import Textarea from "@app/components/Textarea.svelte";

  export let id: string | undefined = undefined;
  export let authorId: string;
  export let authorAlias: string | undefined = undefined;
  export let body: string;
  export let reactions: [string, string][];
  export let action: "create" | "view" = "view";
  export let caption = "commented";
  export let rawPath: string;
  export let timestamp: number;
  export let isReply: boolean = false;
  export let isLastReply: boolean = false;

  const dispatch = createEventDispatcher<{
    react: { nids: string[]; id: string; reaction: string };
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
    margin-left: auto;
    font-size: var(--font-size-small);
  }
  .card-body {
    word-wrap: break-word;
    font-size: var(--font-size-small);
    padding-left: 2rem;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding-left: 2rem;
    height: 22px;
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
      <div class="timestamp" title={utils.absoluteTimestamp(timestamp)}>
        {utils.formatTimestamp(timestamp)}
      </div>
    </div>
  </div>

  <div class="card-body">
    {#if action === "create"}
      <Textarea
        resizable
        bind:value={body}
        on:submit
        placeholder="Leave a comment" />
    {:else if body.trim() === ""}
      <span class="txt-missing">No description</span>
    {:else}
      <Markdown {rawPath} content={body} />
    {/if}
  </div>
  {#if (id && $httpdStore.state === "authenticated") || (id && groupedReactions.size > 0)}
    <div class="actions">
      {#if id && $httpdStore.state === "authenticated"}
        <ReactionSelector
          nid={$httpdStore.session.publicKey}
          reactions={groupedReactions}
          on:select={event => {
            if (id) {
              dispatch("react", { id, ...event.detail });
            }
          }} />
      {/if}
      {#if id && groupedReactions.size > 0}
        <Reactions
          clickable={$httpdStore.state === "authenticated"}
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
