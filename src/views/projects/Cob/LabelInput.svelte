<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import Badge from "@app/components/Badge.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let locallyAuthenticated: boolean = false;
  export let labels: string[] = [];
  export let submitInProgress: boolean = false;

  let showInput: boolean = false;
  let updatedLabels: string[] = labels;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;
  let valid: boolean = false;
  let sanitizedValue: string | undefined = undefined;

  const removeToggles: Record<string, boolean> = {};

  $: {
    sanitizedValue = inputValue.trim();

    if (inputValue !== "") {
      if (sanitizedValue.length > 0) {
        if (updatedLabels.includes(sanitizedValue)) {
          valid = false;
          validationMessage = "This label is already added";
        } else {
          valid = true;
          validationMessage = undefined;
        }
      }
    } else {
      valid = false;
      validationMessage = "";
    }
  }

  function addLabel() {
    if (valid && sanitizedValue) {
      updatedLabels = [...updatedLabels, sanitizedValue];
      inputValue = "";
      dispatch("save", updatedLabels);
      showInput = false;
    }
  }

  function removeLabel(label: string) {
    updatedLabels = updatedLabels.filter(x => x !== label);
    dispatch("save", updatedLabels);
    showInput = false;
  }
</script>

<style>
  .metadata-section-header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
  }
  .metadata-section-body {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
  }
  .validation-message {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-red);
    position: relative;
    margin-top: 0.5rem;
  }
</style>

<div>
  <div class="metadata-section-header">Labels</div>
  <div class="metadata-section-body">
    {#if locallyAuthenticated}
      {#each updatedLabels as label}
        <Badge
          variant="neutral"
          size="small"
          style="cursor: pointer;"
          on:click={() => (removeToggles[label] = !removeToggles[label])}>
          <div class="label">{label}</div>
          {#if removeToggles[label]}
            <IconButton title="remove label">
              <IconSmall name="cross" on:click={() => removeLabel(label)} />
            </IconButton>
          {/if}
        </Badge>
      {/each}
      {#if showInput}
        <div
          style="width:100%; display: flex; align-items: center; gap: 0.5rem;">
          <TextInput
            autofocus
            {valid}
            disabled={submitInProgress}
            placeholder="Add label"
            bind:value={inputValue}
            on:submit={addLabel} />
          <IconButton
            title="discard label"
            on:click={() => {
              inputValue = "";
              showInput = false;
            }}>
            <IconSmall name="cross" />
          </IconButton>
          <IconButton title="save label" on:click={addLabel}>
            <IconSmall name="checkmark" />
          </IconButton>
        </div>
        {#if !valid && validationMessage}
          <div class="validation-message">
            <IconSmall name="exclamation-circle" />{validationMessage}
          </div>
        {/if}
      {:else}
        <Badge
          variant="outline"
          size="small"
          title="add labels"
          round
          on:click={() => (showInput = true)}>
          <IconSmall name="plus"></IconSmall>
        </Badge>
      {/if}
    {:else}
      {#each updatedLabels as label}
        <Badge variant="neutral" size="small">
          {label}
        </Badge>
      {:else}
        <div class="txt-missing">No labels</div>
      {/each}
    {/if}
  </div>
</div>
