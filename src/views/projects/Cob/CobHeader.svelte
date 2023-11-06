<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import * as utils from "@app/lib/utils";

  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import IconButton from "@app/components/IconButton.svelte";

  export let locallyAuthenticated: boolean = false;
  export let preview: boolean = false;
  export let mode: "readWrite" | "readOnly" = "readOnly";
  export let id: string | undefined = undefined;
  export let title: string = "";
  export let submitInProgress: boolean = false;
  const oldTitle = title;

  const dispatch = createEventDispatcher<{ editTitle: string }>();
</script>

<style>
  .header {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border-hint);
    padding: 1.5rem;
    border-radius: var(--border-radius-small);
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-medium);
    height: 2.5rem;
  }
  .subtitle {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: var(--font-size-small);
    font-family: var(--font-family-monospace);
  }
  .summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .description {
    font-size: var(--font-size-small);
    margin-top: 1rem;
    word-break: break-word;
  }
  .edit-buttons {
    display: flex;
    gap: 0.25rem;
  }
</style>

<div class="header">
  <div class="summary">
    {#if locallyAuthenticated && !preview && mode === "readWrite"}
      <div><slot name="icon" /></div>
      <TextInput
        placeholder="Title"
        bind:value={title}
        showKeyHint={mode === "readWrite" && Boolean(id)}
        on:submit={() => {
          if (mode === "readWrite") {
            mode = "readOnly";
            dispatch("editTitle", title);
          }
        }} />
    {:else if title}
      <div class="title">
        <div><slot name="icon" /></div>
        <InlineMarkdown fontSize="medium" content={title} />
      </div>
    {:else}
      <span class="txt-missing">No title</span>
    {/if}
    <!-- When creating a new COB id is undefined -->
    {#if locallyAuthenticated && id}
      <div class="edit-buttons">
        {#if mode === "readWrite"}
          <IconButton
            title="save title"
            loading={submitInProgress}
            on:click={() => {
              mode = "readOnly";
              dispatch("editTitle", title);
            }}>
            <IconSmall name={"checkmark"} />
          </IconButton>
          <IconButton
            title="dismiss changes"
            loading={submitInProgress}
            on:click={() => {
              title = oldTitle;
              mode = "readOnly";
            }}>
            <IconSmall name={"cross"} />
          </IconButton>
        {:else}
          <IconButton
            title="edit title"
            loading={submitInProgress}
            on:click={() => {
              mode = "readWrite";
              dispatch("editTitle", title);
            }}>
            <IconSmall name={"edit"} />
          </IconButton>
        {/if}
      </div>
    {/if}
  </div>
  <div class="subtitle">
    <slot name="state" />
    {#if id}
      <div class="global-hash">
        {utils.formatObjectId(id)}
      </div>
    {/if}
    <slot name="author" />
  </div>
  <div class="description">
    <slot name="description" />
  </div>
</div>
