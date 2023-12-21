<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import { formatNodeId, parseNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{ save: string[] }>();

  export let locallyAuthenticated: boolean = false;
  export let assignees: string[] = [];
  export let submitInProgress: boolean = false;

  let showInput: boolean = false;
  let updatedAssignees: string[] = assignees;
  let inputValue = "";
  let validationMessage: string | undefined = undefined;
  let valid: boolean = false;
  let assignee: string | undefined = undefined;

  const removeToggles: Record<string, boolean> = {};

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
      dispatch("save", updatedAssignees);
      showInput = false;
    }
  }

  function removeAssignee(assignee: string) {
    updatedAssignees = updatedAssignees.filter(x => x !== assignee);
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
          on:click={() => (removeToggles[assignee] = !removeToggles[assignee])}>
          <div class="assignee">
            <Avatar inline nodeId={assignee} />
            <span>{formatNodeId(assignee)}</span>
            {#if removeToggles[assignee]}
              <IconButton title="remove assignee">
                <IconSmall
                  name="cross"
                  on:click={() => removeAssignee(assignee)} />
              </IconButton>
            {/if}
          </div>
        </Badge>
      {/each}
      {#if showInput}
        <div style="width:100%; display: flex; align-items: center;">
          <TextInput
            {valid}
            autofocus
            disabled={submitInProgress}
            bind:value={inputValue}
            placeholder="Add assignee"
            on:submit={addAssignee} />
          <IconButton
            title="discard assignee"
            on:click={() => {
              inputValue = "";
              showInput = false;
            }}>
            <IconSmall name="cross" />
          </IconButton>
          <IconButton title="save assignee" on:click={addAssignee}>
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
            <Avatar inline nodeId={assignee} />
            <span>{formatNodeId(assignee)}</span>
          </div>
        </Badge>
      {:else}
        <div class="txt-missing">No assignees</div>
      {/each}
    {/if}
  </div>
</div>
