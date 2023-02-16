<script lang="ts" strictEvents>
  import type { MaybeBlob, Project } from "@app/lib/project";
  import type { Session } from "@app/lib/session";

  import * as modal from "@app/lib/modal";
  import AuthenticationErrorModal from "@app/views/session/AuthenticationErrorModal.svelte";
  import Avatar from "@app/components/Comment/Avatar.svelte";
  import Button from "@app/components/Button.svelte";
  import Chip from "@app/components/Chip.svelte";
  import Comment from "@app/components/Comment.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import { Issue } from "@app/lib/issue";
  import { canonicalize, formatNodeId, parseNodeId } from "@app/lib/utils";
  import { createEventDispatcher } from "svelte";

  export let session: Session;
  export let project: Project;

  const dispatch = createEventDispatcher<{ create: never }>();

  // Get an image blob based on a relative path.
  const getImage = async (imagePath: string): Promise<MaybeBlob> => {
    const finalPath = canonicalize(imagePath, "/"); // We only use the root path in issues.
    const commit = project.branches[project.defaultBranch]; // We suppose that all issues are only looked at on HEAD of the default branch.
    return project.getBlob(commit, finalPath);
  };

  let preview: boolean = false;

  function handleAddAssignee() {
    const nodeId = parseNodeId(assignee);
    if (nodeId) {
      if (assignees.includes(nodeId.pubkey)) {
        assigneeCaption = "This user is already assigned";
        return;
      }
      assignees.push(nodeId.pubkey);
      assignees = assignees;
      assignee = "";
    } else {
      assigneeCaption = "This user is not valid";
    }
  }

  function handleAddTag() {
    if (tags.includes(tag)) {
      tagCaption = "This tag already exists";
      return;
    }
    tags.push(tag);
    tags = tags;
    tag = "";
  }

  let issueTitle = "";
  let issueText = "";
  let assignees: string[] = [];
  let assignee: string = "";
  let assigneeCaption: string | undefined = undefined;
  let tags: string[] = [];
  let tag: string = "";
  let tagCaption: string | undefined = undefined;

  async function createIssue() {
    try {
      await Issue.createIssue(
        project.id,
        issueTitle,
        issueText,
        assignees,
        tags,
        project.seed.addr,
        session.id,
      );
      dispatch("create");
    } catch {
      modal.show({
        component: AuthenticationErrorModal,
        props: {
          title: "Authentication failed",
          subtitle: [
            "Could not create the issue. Make sure you're still logged in.",
          ],
        },
      });
    }
  }
</script>

<style>
  main {
    padding: 0 2rem 0 8rem;
  }
  .form {
    display: grid;
    grid-template-columns: minmax(0, 2fr) 1fr;
    margin-bottom: 1rem;
  }
  .side-bar {
    border-left: 1px solid var(--color-foreground-4);
    padding-left: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .actions {
    text-align: right;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    gap: 1rem;
    margin-top: 1rem;
  }
  .editor {
    flex: 2;
    padding-right: 1rem;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 3rem;
  }
  .section:not(:first-child) {
    border-top: 1px solid var(--color-foreground-4);
    padding-top: 1rem;
  }
  .summary {
    padding: 1rem;
    background: var(--color-foreground-1);
    border-radius: var(--border-radius);
    margin-bottom: 2rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .chips {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .tags {
    flex-direction: row;
  }
  .tag {
    max-width: 15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .assignee {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  @media (max-width: 960px) {
    main {
      padding-left: 2rem;
    }
  }
  @media (max-width: 720px) {
    .form {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>

<main>
  <div class="form">
    <div class="editor">
      {#if preview}
        <div class="summary txt-medium" class:txt-missing={preview}>
          {#if issueTitle.trim() === ""}
            No title
          {:else}
            {issueTitle}
          {/if}
        </div>
        <div class="comments">
          <Comment
            comment={{
              author: { id: session.publicKey },
              body: issueText,
              reactions: {},
              replyTo: null,
              timestamp: Date.now(),
            }}
            {getImage} />
        </div>
      {:else}
        <Textarea bind:value={issueTitle} placeholder="Title" />
        <Textarea
          bind:value={issueText}
          resizable
          placeholder="Leave a comment" />
      {/if}
      <div class="actions">
        <Button
          size="small"
          variant="text"
          on:click={() => (preview = !preview)}>
          {#if preview}
            Resume editing
          {:else}
            Preview
          {/if}
        </Button>
        <Button
          disabled={!issueTitle}
          size="small"
          variant="secondary"
          on:click={createIssue}>
          Submit
        </Button>
      </div>
    </div>
    <div class="side-bar layout-desktop">
      <div class="section txt-small">
        <span class="txt-bold">Assignees</span>
        <div class="chips">
          {#each assignees as assignee, key}
            <Chip
              {key}
              removeable
              on:remove={e => {
                assignees.splice(e.detail, 1);
                assignees = assignees;
              }}>
              <div slot="text" class="assignee">
                <Avatar inline source={assignee} title={assignee} />
                <span>{formatNodeId(assignee)}</span>
              </div>
            </Chip>
          {/each}
        </div>
        <div>
          <TextInput
            bind:value={assignee}
            variant="form"
            on:submit={handleAddAssignee}
            on:input={() => (assigneeCaption = undefined)}
            placeholder="Assign this issue"
            validationMessage={assigneeCaption}
            valid={Boolean(parseNodeId(assignee))} />
        </div>
      </div>
      <div class="section txt-small">
        <span class="txt-bold">Tags</span>
        <div class="chips tags">
          {#each tags as tag, key}
            <Chip
              {key}
              removeable
              on:remove={e => {
                tags.splice(e.detail, 1);
                tags = tags;
              }}>
              <span class="tag" slot="text">{tag}</span>
            </Chip>
          {/each}
        </div>
        <div>
          <TextInput
            bind:value={tag}
            variant="form"
            on:input={() => (tagCaption = undefined)}
            on:submit={handleAddTag}
            placeholder="Tag this issue"
            validationMessage={tagCaption}
            valid={tag !== ""} />
        </div>
      </div>
    </div>
  </div>
</main>
