<script lang="ts" strictEvents>
  import type { BaseUrl, Issue, IssueState } from "@httpd-client";
  import type { Item } from "@app/components/Dropdown.svelte";

  import { createEventDispatcher } from "svelte";

  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { sessionStore } from "@app/lib/session";

  import AssigneeInput from "./Cob/AssigneeInput.svelte";
  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import TagInput from "./Cob/TagInput.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import Thread from "@app/components/Thread.svelte";

  export let issue: Issue;
  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let projectHead: string;

  const dispatch = createEventDispatcher<{ update: never }>();
  const rawPath = utils.getRawBasePath(projectId, baseUrl, projectHead);
  const api = new HttpdClient(baseUrl);

  const action: "create" | "edit" | "view" =
    $sessionStore && utils.isLocal(baseUrl.hostname) ? "edit" : "view";
  const items: Item<IssueState>[] = [
    { title: "Reopen issue", state: { status: "open" } as const },
    {
      title: "Close issue as solved",
      state: { status: "closed", reason: "solved" } as const,
    },
    {
      title: "Close issue as other",
      state: { status: "closed", reason: "other" } as const,
    },
  ].map(item => ({
    key: item.title,
    title: item.title,
    value: item.state,
    badge: null,
  }));

  async function createReply({
    detail: reply,
  }: CustomEvent<{ id: string; body: string }>) {
    if ($sessionStore && reply.body.trim().length > 0) {
      await api.project.updateIssue(
        projectId,
        issue.id,
        {
          type: "thread",
          action: { type: "comment", body: reply.body, replyTo: reply.id },
        },
        $sessionStore.id,
      );
      issue = await api.project.getIssueById(projectId, issue.id);
    }
  }

  async function createComment(body: string) {
    if ($sessionStore && body.trim().length > 0) {
      await api.project.updateIssue(
        projectId,
        issue.id,
        { type: "thread", action: { type: "comment", body } },
        $sessionStore.id,
      );
      issue = await api.project.getIssueById(projectId, issue.id);
    }
  }

  async function editTitle({ detail: title }: CustomEvent<string>) {
    if ($sessionStore && title.trim().length > 0 && title !== issue.title) {
      await api.project.updateIssue(
        projectId,
        issue.id,
        { type: "edit", title },
        $sessionStore.id,
      );
      issue = await api.project.getIssueById(projectId, issue.id);
    } else {
      // Reassigning issue.title overwrites the invalid title in IssueHeader
      issue.title = issue.title;
    }
  }

  async function saveTags({ detail: tags }: CustomEvent<string[]>) {
    if ($sessionStore) {
      const { add, remove } = utils.createAddRemoveArrays(issue.tags, tags);
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      await api.project.updateIssue(
        projectId,
        issue.id,
        {
          type: "tag",
          add,
          remove,
        },
        $sessionStore.id,
      );
      issue = await api.project.getIssueById(projectId, issue.id);
    }
  }

  async function saveAssignees({ detail: assignees }: CustomEvent<string[]>) {
    if ($sessionStore) {
      const { add, remove } = utils.createAddRemoveArrays(
        issue.assignees,
        assignees,
      );
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      await api.project.updateIssue(
        projectId,
        issue.id,
        {
          type: "assign",
          add: utils.stripDidPrefix(add),
          remove: utils.stripDidPrefix(remove),
        },
        $sessionStore.id,
      );
      issue = await api.project.getIssueById(projectId, issue.id);
    }
  }

  async function saveStatus({ detail: state }: CustomEvent<IssueState>) {
    if ($sessionStore) {
      await api.project.updateIssue(
        projectId,
        issue.id,
        { type: "lifecycle", state },
        $sessionStore.id,
      );
      dispatch("update");
      issue = await api.project.getIssueById(projectId, issue.id);
    }
  }

  $: selectedItem = issue.state.status === "closed" ? items[0] : items[1];
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
  .metadata {
    border-radius: var(--border-radius);
    font-size: var(--font-size-small);
    padding-left: 1rem;
    margin-left: 1rem;
  }

  .actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin: 0 0 2.5rem 0;
    gap: 1rem;
  }

  @media (max-width: 960px) {
    .issue {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      padding-left: 2rem;
    }
    .metadata {
      display: none;
    }
  }
</style>

<div class="issue">
  <div>
    <CobHeader
      action="edit"
      id={issue.id}
      title={issue.title}
      on:editTitle={editTitle}>
      <svelte:fragment slot="state">
        {#if issue.state.status === "open"}
          <Badge variant="positive">
            {issue.state.status}
          </Badge>
        {:else}
          <Badge variant="negative">
            {issue.state.status} as
            {issue.state.reason}
          </Badge>
        {/if}
        <Authorship
          highlight
          timestamp={issue.discussion[0].timestamp}
          authorId={issue.author.id}
          caption="opened this issue" />
      </svelte:fragment>
    </CobHeader>
    <div>
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
          <CobStateButton
            {items}
            {selectedItem}
            state={issue.state}
            on:saveStatus={saveStatus} />
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
  <div class="metadata">
    <AssigneeInput
      {action}
      assignees={issue.assignees}
      on:save={saveAssignees} />
    <TagInput {action} tags={issue.tags} on:save={saveTags} />
  </div>
</div>
