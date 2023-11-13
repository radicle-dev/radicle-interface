<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import { formatNodeId, parseNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let mode: "readCreate" | "readEdit" | "readOnly" = "readOnly";
  export let locallyAuthenticated: boolean = false;
  export let assignees: string[] = [];
  export let submitInProgress: boolean = false;

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
      if (mode === "readCreate") {
        dispatch("save", updatedAssignees);
      }
    }
  }

  function removeAssignee(assignee: string) {
    updatedAssignees = updatedAssignees.filter(x => x !== assignee);
    if (mode === "readCreate") {
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
    {#if locallyAuthenticated}
      <div class="actions">
        {#if mode === "readEdit"}
          <IconButton
            title="save assignees"
            loading={submitInProgress}
            on:click={() => {
              dispatch("save", updatedAssignees);
              mode = "readOnly";
            }}>
            <IconSmall name="checkmark" />
          </IconButton>
          <IconButton
            title="dismiss changes"
            loading={submitInProgress}
            on:click={() => {
              updatedAssignees = assignees;
              inputValue = "";
              mode = "readOnly";
            }}>
            <IconSmall name="cross" />
          </IconButton>
        {:else if mode !== "readCreate"}
          <IconButton
            title="edit assignees"
            loading={submitInProgress}
            on:click={() => (mode = "readEdit")}>
            <IconSmall name="edit" />
          </IconButton>
        {/if}
      </div>
    {/if}
  </div>
  <div class="body">
    {#if locallyAuthenticated && (mode === "readCreate" || mode === "readEdit")}
      {#each updatedAssignees as assignee}
        <Badge variant="neutral">
          <div class="assignee">
            <Avatar inline nodeId={assignee} />
            <span>{formatNodeId(assignee)}</span>
            <IconButton title="remove assignee">
              <IconSmall
                name="cross"
                on:click={() => removeAssignee(assignee)} />
            </IconButton>
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
  {#if locallyAuthenticated && (mode === "readCreate" || mode === "readEdit")}
    <div style:margin-bottom="1rem" style:margin-top="1rem">
      <TextInput
        {valid}
        {validationMessage}
        disabled={submitInProgress}
        bind:value={inputValue}
        placeholder="Add assignee"
        on:submit={addAssignee} />
    </div>
  {/if}
</div>
