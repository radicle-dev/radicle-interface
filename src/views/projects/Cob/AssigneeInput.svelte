<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import { formatNodeId, parseNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let action: "create" | "edit" | "view";
  export let editInProgress: boolean = false;
  export let assignees: string[] = [];

  let updatedAssignees: string[] = assignees;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;
  let valid: boolean = false;
  let assignee: string | undefined = undefined;

  $: {
    if (inputValue !== "") {
      const parsedNodeId = parseNodeId(inputValue);
      if (parsedNodeId) {
        assignee = `${parsedNodeId.prefix}${parsedNodeId.pubkey}`;
        if (updatedAssignees.includes(assignee)) {
          valid = false;
          validationMessage = "This assignee is already added";
        } else {
          valid = true;
          validationMessage = undefined;
        }
      } else {
        valid = false;
        validationMessage = "This assignee is not valid";
      }
    } else {
      valid = false;
      validationMessage = "";
    }
  }

  function addAssignee() {
    if (valid && assignee) {
      updatedAssignees = [...updatedAssignees, assignee];
      inputValue = "";
      if (action === "create") {
        dispatch("save", updatedAssignees);
      }
    }
  }

  function removeAssignee(assignee: string) {
    updatedAssignees = updatedAssignees.filter(x => x !== assignee);
    if (action === "create") {
      dispatch("save", updatedAssignees);
    }
  }
</script>

<style>
  .header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
  }
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
  }
  .assignee {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.25rem;
  }
</style>

<div>
  <div class="header">
    <span>Assignees</span>
    {#if action === "edit"}
      <div class="actions">
        {#if editInProgress}
          <IconButton
            on:click={() => {
              dispatch("save", updatedAssignees);
              editInProgress = !editInProgress;
            }}>
            <IconSmall name="checkmark" />
          </IconButton>
          <IconButton
            on:click={() => {
              updatedAssignees = assignees;
              inputValue = "";
              editInProgress = !editInProgress;
            }}>
            <IconSmall name="cross" />
          </IconButton>
        {:else}
          <IconButton
            on:click={() => {
              editInProgress = !editInProgress;
            }}>
            <IconSmall name="edit" />
          </IconButton>
        {/if}
      </div>
    {/if}
  </div>
  <div class="body">
    {#if editInProgress || action === "create"}
      {#each updatedAssignees as assignee}
        <Badge variant="neutral">
          <div class="assignee">
            <Avatar inline nodeId={assignee} />
            <span>{formatNodeId(assignee)}</span>
            <span style:cursor="pointer">
              <IconSmall
                name="cross"
                on:click={() => removeAssignee(assignee)} />
            </span>
          </div>
        </Badge>
      {:else}
        <div class="txt-missing">No assignees</div>
      {/each}
    {:else}
      {#each updatedAssignees as assignee}
        <Badge variant="neutral">
          <div class="assignee">
            <Avatar inline nodeId={assignee} />
            <span>{formatNodeId(assignee)}</span>
          </div>
        </Badge>
      {:else}
        <div class="txt-missing">No assignees</div>
      {/each}
    {/if}
  </div>
  {#if editInProgress || action === "create"}
    <div style:margin-bottom="1rem" style:margin-top="1rem">
      <TextInput
        {valid}
        {validationMessage}
        bind:value={inputValue}
        placeholder="Add assignee"
        on:submit={addAssignee} />
    </div>
  {/if}
</div>
