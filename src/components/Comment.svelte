<script lang="ts" strictEvents>
  import type { AuthorAliasColor } from "@app/components/Authorship.svelte";

  import { createEventDispatcher } from "svelte";
  import { httpdStore } from "@app/lib/httpd";

  import Authorship from "@app/components/Authorship.svelte";
  import Floating, { closeFocused } from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";
  import Textarea from "@app/components/Textarea.svelte";

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
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
  }
  .reaction-selector {
    position: absolute;
    top: 2rem;
    right: 0;
  }
  .toggle:hover {
    color: var(--color-foreground-5);
    cursor: pointer;
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
        <div class="toggle" title="toggle-reply">
          <Icon on:click={() => dispatch("toggleReply")} name="arrow-reply" />
        </div>
      {/if}
      {#if id && $httpdStore.state === "authenticated"}
        <div style:position="relative">
          <Floating>
            <div class="reaction-selector" slot="modal">
              <ReactionSelector
                nid={$httpdStore.session.publicKey}
                reactions={groupedReactions}
                on:select={event => {
                  if (id) {
                    dispatch("react", { id, ...event.detail });
                    closeFocused();
                  }
                }} />
            </div>
            <div class="toggle" title="toggle-reaction" slot="toggle">
              <Icon name="face" />
            </div>
          </Floating>
        </div>
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
    {#if id && groupedReactions.size > 0}
      <div style:margin-top="1rem">
        <Reactions
          reactions={groupedReactions}
          on:remove={event => {
            if (id) {
              dispatch("react", { id, ...event.detail });
            }
          }} />
      </div>
    {/if}
  </div>
</div>
