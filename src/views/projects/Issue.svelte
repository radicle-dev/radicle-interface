<script lang="ts" strictEvents>
  import type { Project } from "@app/lib/project";
  import type { IssueState } from "@app/lib/issue";
  import type { State } from "@app/lib/cobs";
  import type { Item } from "@app/components/Dropdown.svelte";

  import Authorship from "@app/components/Authorship.svelte";
  import Avatar from "@app/components/Comment/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobSideInput from "./Cob/CobSideInput.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import Thread from "@app/components/Thread.svelte";
  import { createAddRemoveArrays, Issue } from "@app/lib/issue";
  import { createEventDispatcher } from "svelte";
  import { isLocal } from "@app/lib/utils";
  import { parseNodeId, formatNodeId } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";
  import { validateAssignee, validateTag } from "@app/lib/cobs";

  export let issue: Issue;
  export let project: Project;

  const dispatch = createEventDispatcher<{ update: never }>();
  const rawPath = project.getRawPath();

  const action: "create" | "edit" | "view" =
    $sessionStore && isLocal(project.seed.addr.host) ? "edit" : "view";
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
  .tag {
    overflow: hidden;
    text-overflow: ellipsis;
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
          timestamp={issue.timestamp}
          author={issue.author}
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
    <CobSideInput
      {action}
      title="Assignees"
      placeholder="Add assignee"
      items={[...issue.assignees]}
      on:save={saveAssignees}
      validate={item => Boolean(parseNodeId(item))}
      validateAdd={(item, items) => validateAssignee(item, items)}>
      <svelte:fragment let:item>
        <Avatar inline source={item} title={item} />
        <span>{formatNodeId(item)}</span>
      </svelte:fragment>
    </CobSideInput>
    <CobSideInput
      {action}
      title="Tags"
      placeholder="Add tag"
      items={[...issue.tags]}
      on:save={saveTags}
      validate={item => item.trim().length > 0}
      validateAdd={(item, items) => validateTag(item, items)}>
      <svelte:fragment let:item>
        <div class="tag">{item}</div>
      </svelte:fragment>
    </CobSideInput>
  </div>
</div>
