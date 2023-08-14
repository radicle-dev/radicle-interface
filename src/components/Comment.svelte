<script lang="ts" strictEvents>
  import type { AuthorAliasColor } from "@app/components/Authorship.svelte";

  import config from "@app/config.json";
  import Authorship from "@app/components/Authorship.svelte";
  import Button from "@app/components/Button.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Reaction from "@app/components/Reaction.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import { createEventDispatcher } from "svelte";
  import Floating, { closeFocused } from "@app/components/Floating.svelte";

  export let id: string | undefined = undefined;
  export let authorId: string;
  export let authorAlias: string | undefined = undefined;
  export let authorAliasColor: AuthorAliasColor = "--color-foreground-5";
  export let timestamp: number;
  export let body: string;
  export let reactions: [string, string][];
  export let showReplyIcon: boolean = false;
  export let action: "create" | "view" = "view";
  export let caption = "commented";
  export let rawPath: string;

  const dispatch = createEventDispatcher<{
    toggleReply: null;
    react: { nids: string[]; commentId: string | undefined; reaction: string };
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
    border-radius: inherit;
    background-color: inherit;
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    height: 3rem;
  }
  .card-body {
    font-size: var(--font-size-small);
    padding: 0 1rem 0.7rem 1rem;
  }
  .reaction-selector {
    display: inline-flex;
    background-color: var(--color-background-1);
    border-radius: var(--border-radius-small);
    position: absolute;
    bottom: 2.2rem;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
  }
  .action {
    display: flex;
    gap: 0.5rem;
  }
  .reactions {
    position: relative;
    display: inline-flex;
    gap: 0.3rem;
    margin-top: 1rem;
  }
  .reaction {
    display: inline-flex;
    flex-direction: row;
    gap: 0.5rem;
  }
</style>

<div class="card" {id}>
  <div class="card-header">
    <Authorship
      {caption}
      {authorId}
      {authorAlias}
      {authorAliasColor}
      {timestamp} />
    <div class="actions">
      {#if showReplyIcon}
        <Button
          variant="text"
          size="tiny"
          on:click={() => dispatch("toggleReply")}>
          <div class="action">
            <Icon name="chat" />
            <span>reply</span>
          </div>
        </Button>
      {/if}
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
      <span class="txt-missing">No description.</span>
    {:else}
      <Markdown {rawPath} content={body} />
    {/if}
    <div class="reactions">
      <Floating>
        <div class="reaction-selector" slot="modal">
          {#each config.reactions as reaction}
            <Button
              size="small"
              variant="text"
              on:click={() => {
                dispatch("react", { nids: [], commentId: id, reaction });
                closeFocused();
              }}>
              {reaction}
            </Button>
          {/each}
        </div>
        <Reaction slot="toggle">+</Reaction>
      </Floating>
      {#if groupedReactions.size > 0}
        {#each groupedReactions as [reaction, nids]}
          <Reaction
            on:click={() =>
              dispatch("react", { nids, commentId: id, reaction })}>
            <div class="reaction">
              <span>{reaction}</span>
              <span title={nids.join("\n")}>{nids.length}</span>
            </div>
          </Reaction>
        {/each}
      {/if}
    </div>
  </div>
</div>
