<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import Button from "@app/components/Button.svelte";
  import Chip from "@app/components/Chip.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let action: "create" | "edit" | "view" = "view";
  export let editInProgress: boolean = false;
  export let labels: string[] = [];

  let updatedLabels: string[] = labels;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;

  $: sanitizedValue = inputValue.trim();

  function addLabel() {
    if (sanitizedValue.length > 0) {
      if (updatedLabels.includes(sanitizedValue)) {
        validationMessage = "This label is already added";
      } else {
        updatedLabels = [...updatedLabels, sanitizedValue];
        inputValue = "";
        if (action === "create" || action === "edit") {
          dispatch("save", updatedLabels);
        }
      }
    } else {
      validationMessage = "This label is not valid";
    }
  }

  function removeLabel(remove: string) {
    updatedLabels = updatedLabels.filter(label => label !== remove);
    if (action === "create" || action === "edit") {
      dispatch("save", updatedLabels);
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
  .close {
    color: inherit;
    border: none;
    border-bottom-right-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    background-color: transparent;
    line-height: 1.5;
    padding: 0;
    cursor: pointer;
  }
  .close:hover {
    color: var(--color-foreground);
  }
</style>

<div>
  <div class="metadata-section-header">
    <span>Labels</span>
    {#if action === "edit"}
      {#if editInProgress}
        <Button
          size="tiny"
          variant="text"
          on:click={() => {
            dispatch("save", updatedLabels);
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
    {#each updatedLabels as label}
      <Chip actionable={editInProgress || action === "create"}>
        <div slot="content" aria-label="chip" class="txt-overflow">{label}</div>
        <div slot="icon">
          <button class="section close" on:click={() => removeLabel(label)}>
            ✕
          </button>
        </div>
      </Chip>
    {:else}
      <div class="txt-missing">No labels</div>
    {/each}
  </div>
  {#if editInProgress || action === "create"}
    <div style:margin-bottom="1rem">
      <TextInput
        bind:value={inputValue}
        valid={sanitizedValue.length > 0}
        placeholder="Add label"
        variant="form"
        {validationMessage}
        on:submit={addLabel}
        on:input={() => (validationMessage = undefined)} />
    </div>
  {/if}
</div>
