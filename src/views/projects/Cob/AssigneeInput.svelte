<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import { formatNodeId, parseNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Button from "@app/components/Button.svelte";
  import Chip from "@app/components/Chip.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let action: "create" | "edit" | "view";
  export let editInProgress: boolean = false;
  export let assignees: string[] = [];

  let updatedAssignees: string[] = assignees;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;

  $: parsedNodeId = parseNodeId(inputValue);

  function addAssignee() {
    if (parsedNodeId) {
      const assignee = `${parsedNodeId.prefix}${parsedNodeId.pubkey}`;
      if (updatedAssignees.includes(assignee)) {
        validationMessage = "This assignee is already added";
      } else {
        updatedAssignees = [...updatedAssignees, assignee];
        inputValue = "";
        if (action === "create") {
          dispatch("save", updatedAssignees);
        }
      }
    } else {
      validationMessage = "This assignee is not valid";
    }
  }

  function removeAssignee(remove: string) {
    updatedAssignees = updatedAssignees.filter(assignee => assignee !== remove);
    if (action === "create" || action === "edit") {
      dispatch("save", updatedAssignees);
    }
  }
</script>

<style>
  .header {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
    color: var(--color-foreground-6);
  }
  .body {
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

  .chip-content {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
  }
</style>

<div>
  <div class="header">
    <span>Assignees</span>
    {#if action === "edit"}
      {#if editInProgress}
        <Button
          size="tiny"
          variant="text"
          on:click={() => {
            dispatch("save", updatedAssignees);
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
  <div class="body">
    {#each updatedAssignees as assignee (assignee)}
      <Chip actionable={editInProgress || action === "create"}>
        <div slot="content" aria-label="chip" class="txt-overflow chip-content">
          <Avatar inline nodeId={assignee} />
          <span>{formatNodeId(assignee)}</span>
        </div>
        <button
          slot="icon"
          class="section close"
          on:click={() => removeAssignee(assignee)}>
          ✕
        </button>
      </Chip>
    {:else}
      <div class="txt-missing">No assignees</div>
    {/each}
  </div>
  {#if editInProgress || action === "create"}
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
