<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { isMac } from "@app/lib/utils";

  export let resizable: boolean = false;
  export let value: string | number | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let focus: boolean = false;

  let textareaElement: HTMLTextAreaElement | undefined = undefined;

  // We either auto-grow the text area, or allow the user to resize it. These
  // options are mutually exclusive because a user resized textarea would
  // automatically shrink upon text input otherwise.
  $: if (textareaElement && !resizable) {
    // React to changes to the textarea content.
    value;

    // Reset height to 0px on every value change so that the textarea
    // immediately shrinks when all text is deleted.
    textareaElement.style.height = `0px`;
    textareaElement.style.height = `${textareaElement.scrollHeight}px`;
  }

  $: if (textareaElement && focus) {
    textareaElement.focus();
    focus = false;
  }

  const dispatch = createEventDispatcher<{
    submit: null;
  }>();

  function handleKeydown(event: KeyboardEvent) {
    const auxiliarKey = isMac() ? event.metaKey : event.ctrlKey;
    if (auxiliarKey && event.key === "Enter") {
      dispatch("submit");
    }
    if (event.key === "Escape") {
      textareaElement?.blur();
    }
  }
</script>

<style>
  textarea {
    background-color: var(--color-foreground-1);
    border: 1px solid var(--color-foreground-1);
    color: var(--color-foreground);
    border-radius: 0.5rem;
    font-family: inherit;
    height: 5rem;
    padding: 1rem;
    width: 100%;
    min-height: 2.5rem;
    resize: none;
    overflow: hidden;
  }

  .resizable {
    resize: vertical;
    overflow: scroll;
  }

  textarea::-webkit-scrollbar {
    display: none;
  }

  textarea::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  textarea::-webkit-resizer {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAD9QTFRFAAAAZWZmZmZmZmVmZWVmwsLBwsLCZ2ZmwsPCZmdlZWZnwcLBZmZkYGJjw8LDwsPBZmZnZWZkZ2ZkwMDBWFtcNbXb2AAAABV0Uk5TAP///////////////////////1H/YDRrSAAAAFBJREFUeJxVjUESgCAMA2mqAoqK6P/f6kzjIXIos5NumpI8g5LbpJnNQvDl52mWUYTquqnXwstshpHaTi+o+hHXccoKmHVW9yvIxv218ntivmOYAWpLfqaRAAAAAElFTkSuQmCC);
    background-size: 7px;
    background-repeat: no-repeat;
    background-position: bottom 1px right 1px;
  }

  textarea::placeholder {
    color: var(--color-foreground-5);
  }

  textarea:focus,
  textarea:hover {
    border: 1px solid var(--color-foreground-4);
  }
  .caption {
    color: var(--color-foreground-4);
    margin-left: 0.75rem;
    text-align: left;
  }
</style>

<textarea
  bind:this={textareaElement}
  bind:value
  class="txt-small"
  class:resizable
  {placeholder}
  on:change
  on:click
  on:input
  on:keydown|stopPropagation={handleKeydown}
  on:keypress />

<div class="caption txt-small">
  Markdown supported. Press {isMac() ? "⌘" : "ctrl"}↵ to comment.
</div>
