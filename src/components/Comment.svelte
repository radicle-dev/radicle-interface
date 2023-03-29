<script lang="ts" strictEvents>
  import type { Author } from "@app/lib/cobs";

  import Authorship from "@app/components/Authorship.svelte";
  import Button from "@app/components/Button.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import { createEventDispatcher } from "svelte";

  export let id: string | undefined = undefined;
  export let author: Author;
  export let timestamp: number;
  export let body: string;
  export let action: "create" | "view" = "view";
  export let caption = "commented";
  export let rawPath: string;
  export let actionText: string | undefined = undefined;
  export let icon: "chat" | undefined = undefined;

  const dispatch = createEventDispatcher<{ edit: string; toggle: never }>();
</script>

<style>
  .comment {
    margin-bottom: 1rem;
    display: flex;
  }
  .card {
    flex: 1;
    border: 1px solid var(--color-foreground-4);
    border-radius: var(--border-radius);
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
    padding: 0rem 1rem 1rem 1rem;
    word-break: break-all;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
  }
  .action {
    display: flex;
    gap: 0.5rem;
  }
</style>

<div class="comment" {id}>
  <div class="card">
    <div class="card-header">
      <div class="layout-desktop">
        <Authorship {caption} {author} {timestamp} />
      </div>
      <div class="layout-mobile">
        <Authorship {author} {timestamp} />
      </div>
      <div class="actions">
        {#if actionText}
          <Button
            variant="text"
            size="tiny"
            on:click={() => {
              if (actionText === "edit") {
                dispatch("edit", body);
              } else {
                dispatch("toggle");
              }
            }}>
            <div class="action">
              {#if icon}
                <Icon name={icon} />
              {/if}
              <span>{actionText}</span>
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
        <Markdown {rawPath} breaks content={body} />
      {/if}
    </div>
  </div>
</div>
