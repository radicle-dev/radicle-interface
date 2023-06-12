<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import Button from "@app/components/Button.svelte";
  import Chip from "@app/components/Chip.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let action: "create" | "edit" | "view" = "view";
  export let editInProgress: boolean = false;
  export let tags: string[] = [];

  let updatedTags: string[] = tags;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;

  $: sanitizedValue = inputValue.trim();

  function addTag() {
    if (sanitizedValue.length > 0) {
      if (updatedTags.includes(sanitizedValue)) {
        validationMessage = "This tag is already added";
      } else {
        updatedTags = [...updatedTags, sanitizedValue];
        inputValue = "";
        if (action === "create") {
          dispatch("save", updatedTags);
        }
      }
    } else {
      validationMessage = "This tag is not valid";
    }
  }

  function removeTag({ detail: key }: { detail: number }) {
    updatedTags = updatedTags.filter((_, i) => i !== key);
    if (action === "create") {
      dispatch("save", updatedTags);
    }
  }
</script>

<style>
  .metadata-section-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
    color: var(--color-foreground-6);
  }
  .metadata-section-body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .tag {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

<div>
  <div class="metadata-section-header">
    <span>Tags</span>
    {#if action === "edit"}
      {#if editInProgress}
        <Button
          size="tiny"
          variant="text"
          on:click={() => {
            dispatch("save", updatedTags);
            editInProgress = !editInProgress;
          }}>
          save
        </Button>
      {:else}
        <Button
          size="tiny"
          variant="text"
          on:click={() => {
            editInProgress = !editInProgress;
          }}>
          edit
        </Button>
      {/if}
    {/if}
  </div>
  <div class="metadata-section-body">
    {#each updatedTags as tag, key (tag)}
      <Chip
        on:remove={removeTag}
        removeable={editInProgress || action === "create"}
        {key}>
        <div aria-label="chip" class="tag">{tag}</div>
      </Chip>
    {:else}
      <div class="txt-missing">No tags</div>
    {/each}
  </div>
  {#if editInProgress || action === "create"}
    <div style:margin-bottom="1rem">
      <TextInput
        bind:value={inputValue}
        valid={sanitizedValue.length > 0}
        placeholder="Add tag"
        variant="form"
        {validationMessage}
        on:submit={addTag}
        on:input={() => (validationMessage = undefined)} />
    </div>
  {/if}
</div>
