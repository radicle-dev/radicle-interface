<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import * as utils from "@app/lib/utils";

  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import IconButton from "@app/components/IconButton.svelte";

  export let action: "create" | "edit" | "view" = "view";
  export let id: string | undefined = undefined;
  export let title: string = "";
  const oldTitle = title;

  const dispatch = createEventDispatcher<{ editTitle: string }>();

  $: editable = action === "create" ? true : false;
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
  }
  .edit-buttons {
    display: flex;
    gap: 0.25rem;
  }
</style>

<div class="header">
  <div class="summary">
    {#if editable}
      <div><slot name="icon" /></div>
      <TextInput
        placeholder="Title"
        bind:value={title}
        showKeyHint={action === "edit"}
        on:submit={() => {
          if (action === "edit") {
            editable = !editable;
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
    {#if action === "edit"}
      <div class="edit-buttons">
        {#if editable}
          <IconButton
            title="save title"
            on:click={() => {
              editable = !editable;
              dispatch("editTitle", title);
            }}>
            <IconSmall name={"checkmark"} />
          </IconButton>
          <IconButton
            title="dismiss changes"
            on:click={() => {
              title = oldTitle;
              editable = !editable;
            }}>
            <IconSmall name={"cross"} />
          </IconButton>
        {:else}
          <IconButton
            title="edit title"
            on:click={() => {
              editable = !editable;
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
