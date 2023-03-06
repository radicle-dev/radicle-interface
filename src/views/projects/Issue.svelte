<script lang="ts" strictEvents>
  import type { Project } from "@app/lib/project";
  import type { State } from "@app/lib/issue";

  import Button from "@app/components/Button.svelte";
  import IssueHeader from "@app/views/projects/Issue/IssueHeader.svelte";
  import IssueSidebar from "@app/views/projects/Issue/IssueSidebar.svelte";
  import IssueStateButton from "@app/views/projects/Issue/IssueStateButton.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import Thread from "@app/components/Thread.svelte";
  import { createAddRemoveArrays, Issue } from "@app/lib/issue";
  import { createEventDispatcher } from "svelte";
  import { isLocal } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";

  export let issue: Issue;
  export let project: Project;

  const dispatch = createEventDispatcher<{ update: never }>();
  const rawPath = project.getRawPath();

  async function createReply({
    detail: reply,
  }: CustomEvent<{ id: string; body: string }>) {
    if ($sessionStore && reply.body.trim().length > 0) {
      await issue.replyComment(
        project.id,
        reply.body,
        reply.id,
        project.seed.addr,
        $sessionStore.id,
      );
      issue = await Issue.getIssue(project.id, issue.id, project.seed.addr);
    }
  }

  async function createComment(body: string) {
    if ($sessionStore && body.trim().length > 0) {
      await issue.createComment(
        project.id,
        body,
        project.seed.addr,
        $sessionStore.id,
      );
      issue = await Issue.getIssue(project.id, issue.id, project.seed.addr);
    }
  }

  async function editTitle({ detail: title }: CustomEvent<string>) {
    if ($sessionStore && title.trim().length > 0 && title !== issue.title) {
      await issue.editTitle(
        project.id,
        title,
        project.seed.addr,
        $sessionStore.id,
      );
      issue = await Issue.getIssue(project.id, issue.id, project.seed.addr);
    } else {
      // Reassigning issue.title overwrites the invalid title in IssueHeader
      issue.title = issue.title;
    }
  }

  async function saveTags({ detail: tags }: CustomEvent<string[]>) {
    if ($sessionStore) {
      const { add, remove } = createAddRemoveArrays(issue.tags, tags);
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      await issue.editTags(
        project.id,
        add,
        remove,
        project.seed.addr,
        $sessionStore.id,
      );
      issue = await Issue.getIssue(project.id, issue.id, project.seed.addr);
    }
  }

  async function saveAssignees({ detail: assignees }: CustomEvent<string[]>) {
    if ($sessionStore) {
      const { add, remove } = createAddRemoveArrays(issue.assignees, assignees);
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      await issue.editAssignees(
        project.id,
        add,
        remove,
        project.seed.addr,
        $sessionStore.id,
      );
      issue = await Issue.getIssue(project.id, issue.id, project.seed.addr);
    }
  }

  async function saveStatus({ detail: state }: CustomEvent<State>) {
    if ($sessionStore) {
      await issue.changeState(
        project.id,
        state,
        project.seed.addr,
        $sessionStore.id,
      );
      dispatch("update");
      issue = await Issue.getIssue(project.id, issue.id, project.seed.addr);
    }
  }

  $: threads = issue.discussion
    .filter(comment => !comment.replyTo)
    .map(thread => {
      return {
        root: thread,
        replies: issue.discussion
          .filter(comment => comment.replyTo === thread.id)
          .sort((a, b) => a.timestamp - b.timestamp),
      };
    }, []);

  let commentBody: string = "";
</script>

<style>
  .issue {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
    padding: 0 2rem 0 8rem;
    margin-bottom: 4.5rem;
  }

  .actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin: 0 0 2.5rem 0;
    gap: 1rem;
  }

  @media (max-width: 720px) {
    .issue {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      padding-left: 2rem;
    }
  }

  @media (max-width: 960px) {
    .issue {
      padding-left: 2rem;
    }
  }
</style>

<div class="issue">
  <div>
    <IssueHeader
      action="edit"
      id={issue.id}
      author={issue.author}
      timestamp={issue.timestamp}
      state={issue.state}
      title={issue.title}
      on:editTitle={editTitle} />
    <div class="comments">
      {#each threads as thread, index (thread.root.id)}
        <Thread
          {thread}
          {rawPath}
          isDescription={index === 0}
          on:reply={createReply} />
      {/each}
      {#if $sessionStore}
        <Textarea
          resizable
          on:submit={() => {
            createComment(commentBody);
            commentBody = "";
          }}
          bind:value={commentBody}
          placeholder="Leave your comment" />
        <div class="actions txt-small">
          <IssueStateButton {issue} on:saveStatus={saveStatus} />
          <Button
            variant="secondary"
            size="small"
            disabled={!commentBody}
            on:click={() => {
              createComment(commentBody);
              commentBody = "";
            }}>
            Comment
          </Button>
        </div>
      {/if}
    </div>
  </div>
  <!-- We need to spread issue.tags and issue.assignees to clone the object property
         else we pass a reference to the issue object. -->
  <IssueSidebar
    on:saveAssignees={saveAssignees}
    on:saveTags={saveTags}
    action={$sessionStore && isLocal(project.seed.addr.host) ? "edit" : "view"}
    tags={[...issue.tags]}
    assignees={[...issue.assignees]} />
</div>
