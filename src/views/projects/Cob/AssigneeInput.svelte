<script lang="ts" strictEvents>
  import type { Reaction } from "@httpd-client";

  import { createEventDispatcher } from "svelte";

  import { formatNodeId, parseNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{
    save: Reaction["authors"];
  }>();

  export let locallyAuthenticated: boolean = false;
  export let assignees: Reaction["authors"] = [];
  export let submitInProgress: boolean = false;

  let showInput: boolean = false;
  let updatedAssignees: Reaction["authors"] = assignees;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;
  let assignee: string | undefined = undefined;

  const removeToggles: Record<string, boolean> = {};

  // Clear validationMessage if inputValue changes
  $: {
    inputValue;
    validationMessage = undefined;
  }

  function validateInput(input: string): boolean {
    if (input !== "") {
      const parsedNodeId = parseNodeId(inputValue);
      if (parsedNodeId) {
        assignee = `${parsedNodeId.prefix}${parsedNodeId.pubkey}`;
        if (updatedAssignees.find(({ id }) => id === assignee)) {
          validationMessage = "This assignee is already added";
          return false;
        } else {
          validationMessage = undefined;
          return true;
        }
      } else {
        validationMessage = "This assignee is not valid";
      }
    } else {
      validationMessage = "";
    }
    return false;
  }

  function addAssignee() {
    const valid = validateInput(inputValue);
    if (valid && assignee) {
      updatedAssignees = [...updatedAssignees, { id: assignee }];
      inputValue = "";
      dispatch("save", updatedAssignees);
      showInput = false;
    }
  }

  function removeAssignee(assignee: string) {
    updatedAssignees = updatedAssignees.filter(({ id }) => id !== assignee);
    dispatch("save", updatedAssignees);
    showInput = false;
  }
</script>

<style>
  .header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
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
  <div class="header">Assignees</div>
  <div class="body">
    {#if locallyAuthenticated}
      {#each updatedAssignees as assignee}
        <Badge
          variant="neutral"
          size="small"
          style="cursor: pointer;"
          on:click={() =>
            (removeToggles[assignee.id] = !removeToggles[assignee.id])}>
          <div class="assignee">
            <Avatar inline nodeId={assignee.id} />
            <span>{formatNodeId(assignee.id)}</span>
            {#if removeToggles[assignee.id]}
              <IconButton title="remove assignee">
                <IconSmall
                  name="cross"
                  on:click={() => removeAssignee(assignee.id)} />
              </IconButton>
            {/if}
          </div>
        </Badge>
      {/each}
      {#if showInput}
        <div
          style="width:100%; display: flex; align-items: center; gap: 0.5rem;">
          <TextInput
            autofocus
            disabled={submitInProgress}
            bind:value={inputValue}
            placeholder="Add assignee"
            on:submit={addAssignee} />
          <IconButton
            title="discard assignee"
            on:click={() => {
              inputValue = "";
              validationMessage = undefined;
              showInput = false;
            }}>
            <IconSmall name="cross" />
          </IconButton>
          <IconButton title="save assignee" on:click={addAssignee}>
            <IconSmall name="checkmark" />
          </IconButton>
        </div>
        {#if validationMessage}
          <div class="validation-message">
            <IconSmall name="exclamation-circle" />{validationMessage}
          </div>
        {/if}
      {:else}
        <Badge
          variant="outline"
          size="small"
          title="add assignee"
          round
          on:click={() => (showInput = true)}>
          <IconSmall name="plus" />
        </Badge>
      {/if}
    {:else}
      {#each updatedAssignees as assignee}
        <Badge variant="neutral" size="small">
          <div class="assignee">
            <Avatar inline nodeId={assignee.id} />
            <span>{formatNodeId(assignee.id)}</span>
          </div>
        </Badge>
      {:else}
        <div class="txt-missing">No assignees</div>
      {/each}
    {/if}
  </div>
</div>
