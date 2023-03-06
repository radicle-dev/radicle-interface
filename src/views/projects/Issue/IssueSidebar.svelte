<script lang="ts" strictEvents>
  import Avatar from "@app/components/Comment/Avatar.svelte";
  import Button from "@app/components/Button.svelte";
  import Chip from "@app/components/Chip.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { formatNodeId, parseNodeId } from "@app/lib/utils";

  export let action: "create" | "edit" | "view" = "view";
  export let assignees: string[] = [];
  export let tags: string[] = [];

  const dispatch = createEventDispatcher<{
    saveAssignees: string[];
    saveTags: string[];
  }>();

  let editAssignees: boolean = false;
  let editTags: boolean = false;

  let assignee: string = "";
  let newAssignees: string[] = [];
  let assigneeCaption: string | undefined = undefined;
  let tag: string = "";
  let newTags: string[] = [];
  let tagCaption: string | undefined = undefined;

  onMount(() => {
    newAssignees = assignees;
    newTags = tags;
  });

  function handleAddAssignee() {
    const nodeId = parseNodeId(assignee);
    if (nodeId) {
      if (newAssignees.includes(`${nodeId.prefix}${nodeId.pubkey}`)) {
        assigneeCaption = "This user is already assigned";
        return;
      }
      newAssignees = [...newAssignees, `${nodeId.prefix}${nodeId.pubkey}`];
      if (action === "create") {
        dispatch("saveAssignees", newAssignees);
      }
      assignee = "";
    } else {
      assigneeCaption = "This user is not valid";
    }
  }

  function handleAddTag() {
    if (newTags.includes(tag)) {
      tagCaption = "This tag already exists";
      return;
    }
    newTags = [...newTags, tag];
    if (action === "create") {
      dispatch("saveTags", newTags);
    }
    tag = "";
  }
</script>

<style>
  .assignee {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .tag {
    max-width: 15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .metadata {
    margin-left: 1rem;
    border-radius: var(--border-radius);
    font-size: var(--font-size-small);
    padding-left: 1rem;
  }
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

<div class="metadata layout-desktop">
  <div class="metadata-section">
    <div class="metadata-section-header">
      <span>Assignees</span>
      {#if action === "edit"}
        {#if !editAssignees}
          <Button
            size="tiny"
            variant="text"
            on:click={() => (editAssignees = !editAssignees)}>
            edit
          </Button>
        {:else}
          <Button
            size="tiny"
            variant="text"
            on:click={() => {
              dispatch("saveAssignees", newAssignees);
              editAssignees = !editAssignees;
            }}>
            save
          </Button>
        {/if}
      {/if}
    </div>
    <div class="metadata-section-body">
      {#each newAssignees as assignee, key (assignee)}
        <Chip
          on:remove={({ detail: key }) =>
            (newAssignees = newAssignees.filter((_, i) => i !== key))}
          removeable={editAssignees || action === "create"}
          {key}>
          <div slot="text" class="assignee">
            <Avatar inline source={assignee} title={assignee} />
            <span>{formatNodeId(assignee)}</span>
          </div>
        </Chip>
      {:else}
        <div class="metadata-section-empty">No assignees</div>
      {/each}
    </div>
    {#if editAssignees || action === "create"}
      <div style:margin-bottom="1rem">
        <TextInput
          bind:value={assignee}
          variant="form"
          on:submit={handleAddAssignee}
          on:input={() => (assigneeCaption = undefined)}
          placeholder="Assign this issue"
          validationMessage={assigneeCaption}
          valid={Boolean(parseNodeId(assignee))} />
      </div>
    {/if}
  </div>
  <div class="metadata-section">
    <div class="metadata-section-header">
      <span>Tags</span>
      {#if action === "edit"}
        {#if !editTags}
          <Button
            size="tiny"
            variant="text"
            on:click={() => (editTags = !editTags)}>
            edit
          </Button>
        {:else}
          <Button
            size="tiny"
            variant="text"
            on:click={() => {
              dispatch("saveTags", newTags);
              editTags = !editTags;
            }}>
            save
          </Button>
        {/if}
      {/if}
    </div>
    <div class="metadata-section-body">
      {#each newTags as tag, key (tag)}
        <Chip
          on:remove={({ detail: key }) =>
            (newTags = newTags.filter((_, i) => i !== key))}
          removeable={editTags || action === "create"}
          {key}>
          <span class="tag" slot="text">{tag}</span>
        </Chip>
      {:else}
        <div class="metadata-section-empty">No tags</div>
      {/each}
    </div>
    {#if editTags || action === "create"}
      <div style:margin-bottom="1rem">
        <TextInput
          bind:value={tag}
          variant="form"
          on:submit={handleAddTag}
          on:input={() => (tagCaption = undefined)}
          placeholder="Tag this issue"
          validationMessage={tagCaption}
          valid={tag !== ""} />
      </div>
    {/if}
  </div>
</div>
