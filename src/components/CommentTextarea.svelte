<script lang="ts" strictEvents>
  import type { Embed } from "@app/lib/file";

  import { createEventDispatcher } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";
  import { embed } from "@app/lib/file";

  import ErrorModal from "@app/modals/ErrorModal.svelte";

  import Button from "./Button.svelte";
  import IconSmall from "./IconSmall.svelte";
  import Markdown from "./Markdown.svelte";
  import Radio from "./Radio.svelte";
  import Textarea from "./Textarea.svelte";

  export let enableAttachments: boolean = false;
  export let placeholder: string = "Leave your comment";
  export let focus: boolean = false;
  export let inline: boolean = false;

  let commentBody: string = "";
  let active: boolean = false;
  let preview: boolean = false;
  let newEmbeds: Embed[] = [];
  let selectionStart = 0;
  let selectionEnd = 0;

  const dispatch = createEventDispatcher<{
    submit: { comment: string; embeds: Embed[] };
    click: null;
  }>();

  function submit() {
    dispatch("submit", { comment: commentBody, embeds: newEmbeds });
    newEmbeds = [];
    active = false;
  }

  const MAX_BLOB_SIZE = 4_194_304;

  function handleFileDrop(event: DragEvent) {
    if (!enableAttachments) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      const embeds = Array.from(event.dataTransfer.files).map(embed);
      void Promise.all(embeds).then(embeds =>
        embeds.forEach(embed => {
          if (embed.content.length > MAX_BLOB_SIZE) {
            modal.show({
              component: ErrorModal,
              props: {
                title: "File too large",
                subtitle: [
                  "The file you tried to upload is too large.",
                  "The maximum file size is 4MB.",
                ],
                error: { message: `File ${embed.name} is too large` },
              },
            });
            return;
          }
          newEmbeds = [
            ...newEmbeds,
            {
              oid: embed.oid,
              name: embed.name,
              content: embed.content,
            },
          ];
          const embedText = `![${embed.name}](${embed.oid})\n`;
          commentBody = commentBody
            .slice(0, selectionStart)
            .concat(embedText, commentBody.slice(selectionEnd));
          selectionStart += embedText.length;
          selectionEnd = selectionStart;
        }),
      );
    }
  }
</script>

<style>
  .comment-section {
    border: 1px solid var(--color-border-hint);
    padding: 1rem;
    border-radius: var(--border-radius-small);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .inline {
    border: 0;
    padding: 0;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
  }
  .buttons {
    display: flex;
    margin-left: auto;
    gap: 1rem;
  }
  .caption {
    font-size: var(--font-size-small);
    color: var(--color-fill-gray);
  }
  .preview {
    font-size: var(--font-size-small);
    padding-top: 1rem;
    padding-left: 1rem;
    min-height: 5rem;
  }
  .inactive {
    box-shadow: 0 0 0 1px var(--color-border-hint);
    border-radius: var(--border-radius-small);
    padding: 0.5rem 0.75rem;
    background-color: var(--color-background-dip);
    font-size: var(--font-size-small);
    color: var(--color-fill-gray);
    cursor: text;
  }
  .inactive:hover {
    box-shadow: 0 0 0 1px var(--color-border-default);
  }
</style>

{#if active}
  <div class="comment-section" class:inline>
    <Radio>
      <Button
        styleBorderRadius="0"
        variant={!preview ? "secondary" : "gray"}
        on:click={() => {
          preview = false;
        }}>
        <IconSmall name="edit" />
        Edit
      </Button>
      <Button
        styleBorderRadius="0"
        disabled={commentBody === ""}
        variant={preview ? "secondary" : "gray"}
        on:click={() => {
          preview = true;
        }}>
        <IconSmall name="eye-open" />
        Preview
      </Button>
    </Radio>
    {#if preview}
      <div class="preview">
        <Markdown content={commentBody} embeds={newEmbeds} />
      </div>
    {:else}
      <Textarea
        on:drop={handleFileDrop}
        bind:selectionEnd
        bind:selectionStart
        {focus}
        resizable
        on:submit={submit}
        bind:value={commentBody}
        {placeholder} />
    {/if}
    <div class="actions">
      {#if !preview}
        <div class="caption">
          Markdown supported. {#if enableAttachments}Drop attachments into the
            text area.{/if} Press {utils.isMac() ? "⌘" : "ctrl"}↵ to submit.
        </div>
      {/if}
      <div class="buttons">
        <Button
          variant="outline"
          on:click={() => {
            preview = false;
            active = false;
          }}>
          Cancel
        </Button>
        <Button variant="secondary" disabled={!commentBody} on:click={submit}>
          Comment
        </Button>
      </div>
    </div>
  </div>
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="inactive"
    role="button"
    tabindex="0"
    on:click={() => {
      commentBody = "";
      active = true;
      dispatch("click");
    }}>
    {placeholder}
  </div>
{/if}
