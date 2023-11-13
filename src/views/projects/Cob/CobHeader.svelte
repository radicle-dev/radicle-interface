<script lang="ts" strictEvents>
  import * as utils from "@app/lib/utils";

  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import IconButton from "@app/components/IconButton.svelte";

  export let preview: boolean = false;
  export let mode: "readCreate" | "readWrite" | "readOnly" = "readOnly";
  export let id: string | undefined = undefined;
  export let title: string = "";
  export let editTitle: ((title: string) => Promise<void>) | undefined =
    undefined;

  async function handleTitleEdit() {
    if (editTitle) {
      mode = "readOnly";
      submitNewTitle = true;
      try {
        await editTitle(title);
      } finally {
        submitNewTitle = false;
      }
    }
  }

  const oldTitle = title;
  let submitNewTitle = false;
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
    {#if (editTitle && !preview && mode === "readWrite") || (!preview && mode === "readCreate")}
      <div><slot name="icon" /></div>
      <TextInput
        placeholder="Title"
        bind:value={title}
        showKeyHint={mode === "readWrite" && Boolean(id)}
        on:submit={handleTitleEdit} />
    {:else if title}
      <div class="title">
        <div><slot name="icon" /></div>
        <InlineMarkdown fontSize="medium" content={title} />
      </div>
    {:else}
      <span class="txt-missing">No title</span>
    {/if}
    <!-- When creating a new COB id is undefined -->
    {#if editTitle && id}
      <div class="edit-buttons">
        {#if mode === "readWrite"}
          <IconButton
            title="save title"
            loading={submitNewTitle}
            on:click={handleTitleEdit}>
            <IconSmall name={"checkmark"} />
          </IconButton>
          <IconButton
            title="dismiss changes"
            loading={submitNewTitle}
            on:click={() => {
              title = oldTitle;
              mode = "readOnly";
            }}>
            <IconSmall name={"cross"} />
          </IconButton>
        {:else}
          <IconButton
            title="edit title"
            loading={submitNewTitle}
            on:click={() => (mode = "readWrite")}>
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
