<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import Badge from "@app/components/Badge.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let mode: "readCreate" | "readEdit" | "readOnly" = "readOnly";
  export let locallyAuthenticated: boolean = false;
  export let labels: string[] = [];
  export let submitInProgress: boolean = false;

  let updatedLabels: string[] = labels;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;
  let valid: boolean = false;
  let sanitizedValue: string | undefined = undefined;

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
      if (mode === "readCreate") {
        dispatch("save", updatedLabels);
      }
    }
  }

  function removeLabel(label: string) {
    updatedLabels = updatedLabels.filter(x => x !== label);
    if (mode === "readCreate") {
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
  }
  .metadata-section-body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
  }
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
</style>

<div>
  <div class="metadata-section-header">
    <span>Labels</span>
    {#if locallyAuthenticated}
      <div class="actions">
        {#if mode === "readEdit"}
          <IconButton
            loading={submitInProgress}
            title="save labels"
            on:click={() => {
              dispatch("save", updatedLabels);
              mode = "readOnly";
            }}>
            <IconSmall name="checkmark" />
          </IconButton>
          <IconButton
            loading={submitInProgress}
            title="dismiss changes"
            on:click={() => {
              updatedLabels = labels;
              inputValue = "";
              mode = "readOnly";
            }}>
            <IconSmall name="cross" />
          </IconButton>
        {:else if mode !== "readCreate"}
          <IconButton
            loading={submitInProgress}
            title="edit labels"
            on:click={() => (mode = "readEdit")}>
            <IconSmall name="edit" />
          </IconButton>
        {/if}
      </div>
    {/if}
  </div>
  <div class="metadata-section-body">
    {#if locallyAuthenticated && (mode === "readCreate" || mode === "readEdit")}
      {#each updatedLabels as label}
        <Badge variant="neutral">
          <div aria-label="chip" class="label">{label}</div>
          <span style:cursor="pointer">
            <IconSmall name="cross" on:click={() => removeLabel(label)} />
          </span>
        </Badge>
      {:else}
        <div class="txt-missing">No labels</div>
      {/each}
    {:else}
      {#each updatedLabels as label}
        <Badge variant="neutral">
          {label}
        </Badge>
      {:else}
        <div class="txt-missing">No labels</div>
      {/each}
    {/if}
  </div>
  {#if locallyAuthenticated && (mode === "readCreate" || mode === "readEdit")}
    <div style:margin-bottom="2rem" style:margin-top="1rem">
      <TextInput
        {valid}
        {validationMessage}
        disabled={submitInProgress}
        bind:value={inputValue}
        placeholder="Add label"
        on:submit={addLabel} />
    </div>
  {/if}
</div>
