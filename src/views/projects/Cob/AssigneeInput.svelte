<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import { formatNodeId, parseNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Button from "@app/components/Button.svelte";
  import Chip from "@app/components/Chip.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let action: "create" | "edit" | "view";
  export let edit: boolean = false;
  export let assignees: string[] = [];

  let updatedAssignees: string[] = assignees;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;

  $: parsedNodeId = parseNodeId(inputValue);

  function addAssignee() {
    if (parsedNodeId) {
      if (updatedAssignees.includes(parsedNodeId.pubkey)) {
        validationMessage = "This assignee is already added";
      } else {
        updatedAssignees = [...updatedAssignees, parsedNodeId.pubkey];
        inputValue = "";
        if (action === "create") {
          dispatch("save", updatedAssignees);
        }
      }
    } else {
      validationMessage = "This assignee is not valid";
    }
  }

  function removeAssignee({ detail: key }: { detail: number }) {
    updatedAssignees = updatedAssignees.filter((_, i) => i !== key);
    if (action === "create") {
      dispatch("save", updatedAssignees);
    }
  }
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
    color: var(--color-foreground-6);
  }
  .metadata-section-body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .metadata-section-empty {
    color: var(--color-foreground-5);
  }
</style>

<div class="metadata-section">
  <div class="metadata-section-header">
    <span>Assignees</span>
    {#if action === "edit"}
      {#if !edit}
        <Button
          size="tiny"
          variant="text"
          on:click={() => {
            edit = !edit;
          }}>
          edit
        </Button>
      {:else}
        <Button
          size="tiny"
          variant="text"
          on:click={() => {
            dispatch("save", updatedAssignees);
            edit = !edit;
          }}>
          save
        </Button>
      {/if}
    {/if}
  </div>
  <div class="metadata-section-body">
    {#each updatedAssignees as assignee, key (assignee)}
      <Chip
        on:remove={removeAssignee}
        removeable={edit || action === "create"}
        {key}>
        <Avatar inline nodeId={assignee} />
        <span>{formatNodeId(assignee)}</span>
      </Chip>
    {:else}
      <div class="metadata-section-empty">No assignees</div>
    {/each}
  </div>
  {#if edit || action === "create"}
    <div style:margin-bottom="1rem">
      <TextInput
        bind:value={inputValue}
        valid={Boolean(parsedNodeId)}
        placeholder="Add assignee"
        variant="form"
        {validationMessage}
        on:submit={addAssignee}
        on:input={() => (validationMessage = undefined)} />
    </div>
  {/if}
</div>
