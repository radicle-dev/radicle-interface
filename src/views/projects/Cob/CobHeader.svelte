<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import * as utils from "@app/lib/utils";
  import Button from "@app/components/Button.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  export let action: "create" | "edit" | "view" = "view";
  export let id: string | undefined = undefined;
  export let title: string = "";

  const dispatch = createEventDispatcher<{ editTitle: string }>();

  $: editable = action === "create" ? true : false;
</script>

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--color-foreground-3);
    padding: 1rem;
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    color: var(--color-foreground-6);
  }
  .summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .id {
    display: flex;
    align-items: center;
  }
  .description {
    font-size: var(--font-size-small);
    margin-top: 1rem;
  }
</style>

<header>
  <div class="summary txt-medium">
    {#if editable}
      <TextInput variant="form" placeholder="Title" bind:value={title} />
    {:else if title}
      <div class="title">
        <InlineMarkdown fontSize="medium" content={title} />
      </div>
    {:else}
      <span class="txt-missing">No title</span>
    {/if}
    {#if action === "edit"}
      <Button
        variant="foreground"
        size="small"
        on:click={() => {
          editable = !editable;
          dispatch("editTitle", title);
        }}>
        {#if editable}
          save
        {:else}
          edit
        {/if}
      </Button>
    {/if}
  </div>
  <div class="subtitle">
    <slot name="state" />
    {#if id}
      <div class="id">
        {utils.formatObjectId(id)}
        <Clipboard text={id} small />
      </div>
    {/if}
    <slot name="author" />
  </div>
  <div class="description">
    <slot name="description" />
  </div>
</header>
