<script lang="ts" strictEvents>
  import type { Reaction } from "@http-client";

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
    font-size: var(--font-size-small);
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
  .input {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  @media (max-width: 1349.98px) {
    .wrapper {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: flex-start;
    }
    .header {
      margin-bottom: 0;
      height: 2rem;
      display: flex;
      align-items: center;
    }
    .body {
      align-items: flex-start;
    }
    .no-assignees {
      height: 2rem;
      display: flex;
      align-items: center;
    }
    .input {
      width: 18rem;
    }
  }
</style>

<div class="wrapper">
  <div class="header">Assignees</div>
  <div class="body">
    {#if locallyAuthenticated}
      {#each updatedAssignees as assignee}
        <Badge
          variant="neutral"
          size="small"
          style="cursor: pointer; max-width: 14rem;"
          on:click={() =>
            (removeToggles[assignee.id] = !removeToggles[assignee.id])}>
          <div class="assignee">
            <Avatar inline nodeId={assignee.id} />
            <span class="txt-overflow">{formatNodeId(assignee.id)}</span>
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
        <div>
          <div class="input">
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
        </div>
      {:else}
        <div class="global-hide-on-mobile-down">
          <Badge
            variant="outline"
            size="small"
            title="add assignee"
            round
            on:click={() => (showInput = true)}>
            <IconSmall name="plus" />
          </Badge>
        </div>
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
        <div class="txt-missing no-assignees">No assignees</div>
      {/each}
    {/if}
  </div>
</div>
