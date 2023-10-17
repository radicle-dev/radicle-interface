<script lang="ts">
  import { afterUpdate, beforeUpdate, createEventDispatcher } from "svelte";
  import { isMac } from "@app/lib/utils";

  export let value: string | number | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let focus: boolean = false;
  // If `false` we automatically grow the textarea height.
  // If `true` we show a resize handle on the lower right-hand side of the
  // textarea to allow resizing the textarea manually.
  export let resizable: boolean = false;

  // Defaulting selectionStart and selectionEnd to 0, since no full support yet.
  export let selectionStart: number = 0;
  export let selectionEnd: number = 0;

  let textareaElement: HTMLTextAreaElement | undefined = undefined;

  // We either auto-grow the textarea, or allow the user to resize it. These
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

  beforeUpdate(() => {
    if (textareaElement) {
      ({ selectionStart, selectionEnd } = textareaElement);
    }
  });

  afterUpdate(() => {
    if (textareaElement) {
      textareaElement.setSelectionRange(selectionStart, selectionEnd);
      textareaElement.focus();
    }
  });

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
    background-color: var(--color-background-dip);
    border: 1px solid var(--color-border-hint);
    color: var(--color-foreground-default);
    border-radius: var(--border-radius-small);
    font-family: inherit;
    height: 5rem;
    padding: 0.75rem;
    width: 100%;
    min-height: 6.375rem;
    resize: none;
    overflow: hidden;
    line-height: 1.625rem;
  }

  .resizable {
    resize: vertical;
    overflow: scroll;
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
    color: var(--color-foreground-dim);
  }
  textarea:focus {
    border: 1px solid var(--color-border-default);
  }
  textarea:hover {
    border: 1px solid var(--color-border-default);
  }
  textarea:focus {
    border: 1px solid var(--color-fill-secondary);
  }
</style>

<textarea
  bind:this={textareaElement}
  bind:value
  aria-label="textarea-comment"
  class="txt-small"
  class:resizable
  {placeholder}
  on:change
  on:click
  on:input
  on:drop
  on:keydown|stopPropagation={handleKeydown}
  on:keypress />
