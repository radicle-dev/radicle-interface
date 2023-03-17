<script lang="ts" strictEvents>
  import Button from "@app/components/Button.svelte";
  import Chip from "@app/components/Chip.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let action: "create" | "edit" | "view" = "view";
  export let title: string;
  export let edit: boolean = false;
  export let items: string[] = [];
  export let validate: (item: string) => boolean;
  export let validateAdd: (
    item: string,
    items: string[],
  ) => { success: false; error: string } | { success: true };
  export let placeholder: string;

  function toggleEdit() {
    edit = !edit;
  }

  function handleAdd() {
    const result = validateAdd(value, newItems);
    if (result.success) {
      newItems = [...newItems, value];
      value = "";
    } else {
      caption = result.error;
    }
  }

  onMount(() => {
    newItems = items;
  });

  let newItems: string[] = [];
  let value = "";
  let caption: string | undefined = undefined;
</script>

<style>
  .metadata-section {
    margin-bottom: 4rem;
  }
  .metadata-section-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
    color: var(--color-foreground-5);
  }
  .metadata-section-body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .metadata-section-empty {
    color: var(--color-foreground-6);
  }
</style>

<div class="metadata-section">
  <div class="metadata-section-header">
    <span>{title}</span>
    {#if action === "edit"}
      {#if !edit}
        <Button size="tiny" variant="text" on:click={toggleEdit}>edit</Button>
      {:else}
        <Button
          size="tiny"
          variant="text"
          on:click={() => {
            dispatch("save", newItems);
            toggleEdit();
          }}>
          save
        </Button>
      {/if}
    {/if}
  </div>
  <div class="metadata-section-body">
    {#each newItems as item, key (item)}
      <Chip
        on:remove={({ detail: key }) => {
          newItems = newItems.filter((_, i) => i !== key);
        }}
        removeable={edit || action === "create"}
        {key}>
        <slot {item} />
      </Chip>
    {:else}
      <div class="metadata-section-empty">No {title.toLowerCase()}</div>
    {/each}
  </div>
  {#if edit || action === "create"}
    <div style:margin-bottom="1rem">
      <TextInput
        bind:value
        valid={validate(value)}
        {placeholder}
        variant="form"
        validationMessage={caption}
        on:submit={handleAdd}
        on:input={() => (caption = undefined)} />
    </div>
  {/if}
</div>
