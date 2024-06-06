<script lang="ts" strictEvents>
  import type { Embed } from "@http-client";

  import { createEventDispatcher } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";
  import { embed } from "@app/lib/file";

  import ErrorModal from "@app/modals/ErrorModal.svelte";

  import Button from "./Button.svelte";
  import IconSmall from "./IconSmall.svelte";
  import Loading from "./Loading.svelte";
  import Markdown from "./Markdown.svelte";
  import Radio from "./Radio.svelte";
  import Textarea from "./Textarea.svelte";

  export let enableAttachments: boolean = false;
  export let placeholder: string = "Leave your comment";
  export let submitCaption: string = "Comment";
  export let focus: boolean = false;
  export let inline: boolean = false;
  export let rawPath: string;
  export let body: string = "";
  export let embeds: Map<string, Embed> = new Map();
  export let submitInProgress: boolean = false;
  export let disallowEmptyBody: boolean = false;
  export let isValid: () => boolean = () => {
    return true;
  };

  let preview: boolean = false;
  let selectionStart = 0;
  let selectionEnd = 0;
  let inputFiles: FileList | undefined = undefined;

  const inputId = `input-label-${crypto.randomUUID()}`;

  const dispatch = createEventDispatcher<{
    submit: { comment: string; embeds: Map<string, Embed> };
    close: null;
    click: null;
  }>();

  function submit() {
    dispatch("submit", { comment: body, embeds });
    preview = false;
  }

  const MAX_BLOB_SIZE = 4_194_304;

  function handleFileDrop(event: { detail: DragEvent }) {
    if (!enableAttachments) {
      return;
    }

    event.detail.preventDefault();
    if (event.detail.dataTransfer) {
      attachEmbeds(event.detail.dataTransfer.files);
    }
  }

  function handleFilePaste(event: ClipboardEvent) {
    // Always allow pasting text content.
    if (event.clipboardData && event.clipboardData.files.length === 0) {
      return;
    }

    if (!enableAttachments) {
      return;
    }

    event.preventDefault();
    if (event.clipboardData) {
      attachEmbeds(event.clipboardData.files);
    }
  }

  function handleFileSelect(event: Event) {
    if (!enableAttachments) {
      return;
    }

    event.preventDefault();
    if (inputFiles) {
      attachEmbeds(inputFiles);
    }
  }

  function attachEmbeds(files: FileList) {
    const embedPromise = Array.from(files).map(embed);
    void Promise.all(embedPromise).then(newEmbeds =>
      newEmbeds.forEach(({ oid, name, content }) => {
        if (content.length > MAX_BLOB_SIZE) {
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
        embeds.set(oid, { name, content });
        const embedText = `![${name}](${oid})\n`;
        body = body
          .slice(0, selectionStart)
          .concat(embedText, body.slice(selectionEnd));
        selectionStart += embedText.length;
        selectionEnd = selectionStart;
      }),
    );
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
    width: 100%;
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
    gap: 1rem;
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
    min-height: 6.375rem;
    padding: 0.75rem;
    margin-left: 1px;
    margin-top: 1px;
  }
  label {
    color: var(--color-foreground-contrast);
  }
  label:hover {
    color: var(--color-foreground-primary);
  }
</style>

<div
  class="comment-section"
  aria-label="extended-textarea"
  title=""
  class:inline>
  <Radio>
    <Button
      styleBorderRadius="0"
      variant={!preview ? "selected" : "not-selected"}
      on:click={() => {
        preview = false;
      }}>
      <IconSmall name="edit" />
      Edit
    </Button>
    <div class="global-spacer" />
    <Button
      styleBorderRadius="0"
      disabled={disallowEmptyBody && body.length === 0}
      variant={preview ? "selected" : "not-selected"}
      on:click={() => {
        preview = true;
      }}>
      <IconSmall name="eye-open" />
      Preview
    </Button>
  </Radio>
  {#if preview}
    <div class="preview">
      <Markdown breaks {rawPath} {embeds} content={body} />
    </div>
  {:else}
    <input
      multiple
      bind:files={inputFiles}
      style:display="none"
      type="file"
      id={inputId}
      on:change={handleFileSelect} />
    <Textarea
      on:drop={handleFileDrop}
      on:paste={handleFilePaste}
      bind:selectionEnd
      bind:selectionStart
      {focus}
      on:submit={submit}
      bind:value={body}
      {placeholder} />
  {/if}
  <div class="actions">
    {#if !preview}
      <div class="caption">
        {#if enableAttachments}
          Add files by dragging & dropping, <label
            for={inputId}
            style:cursor="pointer">
            selecting
          </label>
          or pasting them.
        {/if}
        Markdown supported. Press {utils.modifierKey()}↵ to submit.
      </div>
    {/if}
    <div class="buttons">
      <Button
        disabled={submitInProgress}
        variant="outline"
        on:click={() => {
          preview = false;
          dispatch("close");
        }}>
        Cancel
      </Button>
      <Button
        variant="secondary"
        disabled={!isValid() ||
          submitInProgress ||
          (disallowEmptyBody && body.length === 0)}
        on:click={submit}>
        {#if submitInProgress}
          <Loading small noDelay />
        {:else}
          {submitCaption}
        {/if}
      </Button>
    </div>
  </div>
</div>
