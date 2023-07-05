<script lang="ts">
  import type { BaseUrl, Issue, IssueState } from "@httpd-client";
  import type { IssueUpdateAction } from "@httpd-client/lib/project/issue";
  import type { Session } from "@app/lib/httpd";

  import { isEqual } from "lodash";

  import * as router from "@app/lib/router";
  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import ErrorModal from "@app/views/projects/Cob/ErrorModal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import TagInput from "./Cob/TagInput.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import ThreadComponent from "@app/components/Thread.svelte";

  export let issue: Issue;
  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let projectHead: string;

  const rawPath = utils.getRawBasePath(projectId, baseUrl, projectHead);
  const api = new HttpdClient(baseUrl);

  let action: "edit" | "view";
  $: action =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? "edit"
      : "view";
  const items: [string, IssueState][] = [
    ["Reopen issue", { status: "open" }],
    ["Close issue as solved", { status: "closed", reason: "solved" }],
    ["Close issue as other", { status: "closed", reason: "other" }],
  ];

  async function createReply({
    detail: reply,
  }: CustomEvent<{ id: string; body: string }>) {
    if ($httpdStore.state === "authenticated" && reply.body.trim().length > 0) {
      const status = await updateIssue(
        projectId,
        issue.id,
        {
          type: "thread",
          action: { type: "comment", body: reply.body, replyTo: reply.id },
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(projectId, issue, api);
      }
    }
  }

  async function createComment(body: string) {
    if ($httpdStore.state === "authenticated" && body.trim().length > 0) {
      const status = await updateIssue(
        projectId,
        issue.id,
        { type: "thread", action: { type: "comment", body } },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(projectId, issue, api);
      }
    }
  }

  async function editTitle({ detail: title }: CustomEvent<string>) {
    if (
      $httpdStore.state === "authenticated" &&
      title.trim().length > 0 &&
      title !== issue.title
    ) {
      const status = await updateIssue(
        projectId,
        issue.id,
        { type: "edit", title },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(projectId, issue, api);
      }
      issue.title = issue.title;
    } else {
      // Reassigning issue.title overwrites the invalid title in IssueHeader
      issue.title = issue.title;
    }
  }

  async function saveTags({ detail: tags }: CustomEvent<string[]>) {
    if ($httpdStore.state === "authenticated") {
      const { add, remove } = utils.createAddRemoveArrays(issue.tags, tags);
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      const status = await updateIssue(
        projectId,
        issue.id,
        {
          type: "tag",
          add,
          remove,
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(projectId, issue, api);
      }
    }
  }

  async function saveAssignees({ detail: assignees }: CustomEvent<string[]>) {
    if ($httpdStore.state === "authenticated") {
      const { add, remove } = utils.createAddRemoveArrays(
        issue.assignees,
        assignees,
      );
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      const status = await updateIssue(
        projectId,
        issue.id,
        {
          type: "assign",
          add: utils.stripDidPrefix(add),
          remove: utils.stripDidPrefix(remove),
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(projectId, issue, api);
      }
    }
  }

  async function saveStatus({ detail: state }: CustomEvent<IssueState>) {
    if ($httpdStore.state === "authenticated") {
      const status = await updateIssue(
        projectId,
        issue.id,
        { type: "lifecycle", state },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        void router.push({
          resource: "projects",
          params: {
            id: projectId,
            baseUrl,
            view: {
              resource: "issue",
              params: { issue: issue.id },
            },
          },
        });
      }
    }
  }

  // Refreshes the given issue by fetching it from the server.
  // If the fetch fails, the given issue is returned.
  export async function refreshIssue(
    projectId: string,
    issue: Issue,
    api: HttpdClient,
  ) {
    try {
      return await api.project.getIssueById(projectId, issue.id);
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Unable to fetch issue",
            subtitle: [
              "There was an error while refreshing this issue.",
              "Check your radicle-httpd logs for details.",
            ],
            error,
          },
        });
      }
      return issue;
    }
  }

  export async function updateIssue(
    projectId: string,
    issueId: string,
    action: IssueUpdateAction,
    session: Session,
    api: HttpdClient,
  ): Promise<"success" | "error"> {
    try {
      await api.project.updateIssue(projectId, issueId, action, session.id);
      return "success";
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue editing failed",
            subtitle: [
              "There was an error while updating the issue.",
              "Check your radicle-httpd logs for details.",
            ],
            error,
          },
        });
      }
      return "error";
    }
  }

  const issueDescription = issue.discussion[0];

  $: selectedItem = issue.state.status === "closed" ? items[0] : items[1];
  $: threads = issue.discussion
    .filter(
      comment =>
        (comment.id !== issueDescription.id && !comment.replyTo) ||
        comment.replyTo === issueDescription.id,
    )
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
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
  .author {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
  }
  .thread {
    margin: 1rem 0;
  }
  .open {
    color: var(--color-positive-6);
  }
  .closed {
    color: var(--color-negative-6);
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
      {action}
      id={issue.id}
      title={issue.title}
      on:editTitle={editTitle}>
      <svelte:fragment slot="icon">
        <div
          class="state"
          class:closed={issue.state.status === "closed"}
          class:open={issue.state.status === "open"}>
          <Icon name="exclamation-circle" />
        </div>
      </svelte:fragment>
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
      </svelte:fragment>
      <div slot="description">
        <Markdown
          {baseUrl}
          {projectId}
          content={issue.discussion[0].body}
          rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)} />
      </div>
      <div class="author" slot="author">
        opened by <Authorship
          authorId={issue.author.id}
          authorAlias={issue.author.alias} />
        {utils.formatTimestamp(issue.discussion[0].timestamp)}
      </div>
    </CobHeader>
    {#each threads as thread (thread.root.id)}
      <div class="thread">
        <ThreadComponent
          {baseUrl}
          {projectId}
          {thread}
          {rawPath}
          on:reply={createReply} />
      </div>
    {/each}
    {#if $httpdStore.state === "authenticated"}
      <div style:margin-top="1rem">
        <Textarea
          resizable
          on:submit={async () => {
            await createComment(commentBody);
            commentBody = "";
          }}
          bind:value={commentBody}
          placeholder="Leave your comment" />
        <div class="actions txt-small">
          <CobStateButton
            items={items.filter(([, state]) => !isEqual(state, issue.state))}
            {selectedItem}
            state={issue.state}
            on:saveStatus={saveStatus} />
          <Button
            variant="secondary"
            size="small"
            disabled={!commentBody}
            on:click={async () => {
              await createComment(commentBody);
              commentBody = "";
            }}>
            Comment
          </Button>
        </div>
      </div>
    {/if}
  </div>
  <div class="metadata">
    <AssigneeInput
      {action}
      assignees={issue.assignees}
      on:save={saveAssignees} />
    <TagInput {action} tags={issue.tags} on:save={saveTags} />
  </div>
</div>
