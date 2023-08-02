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
        if (action === "create") {
          dispatch("save", updatedLabels);
        }
      }
    } else {
      validationMessage = "This label is not valid";
    }
  }

  function removeLabel({ detail: key }: { detail: number }) {
    updatedLabels = updatedLabels.filter((_, i) => i !== key);
    if (action === "create") {
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
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    {#each updatedLabels as label, key (label)}
      <Chip
        on:remove={removeLabel}
        removeable={editInProgress || action === "create"}
        {key}>
        <div aria-label="chip" class="label">{label}</div>
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
