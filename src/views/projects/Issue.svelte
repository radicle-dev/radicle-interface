<script lang="ts">
  import type { BaseUrl, Issue, IssueState, Project } from "@httpd-client";
  import type { Embed } from "@app/lib/file";
  import type { IssueUpdateAction } from "@httpd-client/lib/project/issue";
  import type { Session } from "@app/lib/httpd";

  import { isEqual } from "lodash";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { ResponseError } from "@httpd-client/lib/fetcher";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import Badge from "@app/components/Badge.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import CommentTextarea from "@app/components/CommentTextarea.svelte";
  import Embeds from "@app/views/projects/Cob/Embeds.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import LabelInput from "./Cob/LabelInput.svelte";
  import Layout from "./Layout.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";
  import ThreadComponent from "@app/components/Thread.svelte";

  export let baseUrl: BaseUrl;
  export let issue: Issue;
  export let project: Project;
  export let tracking: boolean;

  const rawPath = utils.getRawBasePath(project.id, baseUrl, project.head);
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
  }: CustomEvent<{
    id: string;
    embeds: { name: string; content: string }[];
    body: string;
  }>) {
    if ($httpdStore.state === "authenticated" && reply.body.trim().length > 0) {
      const status = await updateIssue(
        project.id,
        issue.id,
        {
          type: "comment",
          body: reply.body,
          embeds: reply.embeds,
          replyTo: reply.id,
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
    }
  }

  async function createComment(body: string, embeds: Embed[]) {
    if ($httpdStore.state === "authenticated" && body.trim().length > 0) {
      const status = await updateIssue(
        project.id,
        issue.id,
        {
          type: "comment",
          body,
          embeds: embeds,
          replyTo: issue.id,
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
    }
  }

  async function handleReaction({
    nids,
    id,
    reaction,
  }: {
    nids: string[];
    id: string;
    reaction: string;
  }) {
    if ($httpdStore.state === "authenticated") {
      try {
        const status = await updateIssue(
          project.id,
          issue.id,
          {
            type: "comment.react",
            id,
            reaction,
            active: nids.includes($httpdStore.session.publicKey) ? false : true,
          },
          $httpdStore.session,
          api,
        );
        if (status === "success") {
          issue = await refreshIssue(project.id, issue, api);
        }
      } catch (e) {
        console.error(e);
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
        project.id,
        issue.id,
        { type: "edit", title },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
      issue.title = issue.title;
    } else {
      // Reassigning issue.title overwrites the invalid title in IssueHeader
      issue.title = issue.title;
    }
  }

  async function saveLabels({ detail: labels }: CustomEvent<string[]>) {
    if ($httpdStore.state === "authenticated") {
      if (isEqual(issue.labels, labels)) {
        return;
      }
      const status = await updateIssue(
        project.id,
        issue.id,
        {
          type: "label",
          labels: labels,
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
    }
  }

  async function saveAssignees({ detail: assignees }: CustomEvent<string[]>) {
    if ($httpdStore.state === "authenticated") {
      if (isEqual(issue.assignees, assignees)) {
        return;
      }
      const status = await updateIssue(
        project.id,
        issue.id,
        {
          type: "assign",
          assignees: assignees,
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
    }
  }

  async function saveStatus({ detail: state }: CustomEvent<IssueState>) {
    if ($httpdStore.state === "authenticated") {
      const status = await updateIssue(
        project.id,
        issue.id,
        { type: "lifecycle", state },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        void router.push({
          resource: "project.issue",
          project: project.id,
          node: baseUrl,
          issue: issue.id,
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
            error: {
              message: error.message,
              stack: error.stack,
            },
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
      if (error instanceof ResponseError && error.status === 413) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue editing failed",
            subtitle: [
              "Not able to upload the attached file.",
              "Try to reduce the size of your attachment.",
              "Check your radicle-httpd logs for details.",
            ],
            error: {
              message: error.body as string,
              stack: error.stack,
            },
          },
        });
      } else if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue editing failed",
            subtitle: [
              "There was an error while updating the issue.",
              "Check your radicle-httpd logs for details.",
            ],
            error: {
              message: error.message,
              stack: error.stack,
            },
          },
        });
      }
      return "error";
    }
  }

  const issueDescription = issue.discussion[0];

  $: embeds = issue.discussion.reduce(
    (acc, comment) => {
      acc.push(...comment.embeds);
      return acc;
    },
    [] as { name: string; content: string }[],
  );
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
  $: issueReactions = issue.discussion[0].reactions?.reduce(
    (acc, [nid, emoji]) => acc.set(emoji, [...(acc.get(emoji) ?? []), nid]),
    new Map<string, string[]>(),
  );
</script>

<style>
  .issue {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
  }
  .metadata {
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-small);
    padding: 1rem;
    margin-left: 3rem;
    border: 1px solid var(--color-border-hint);
    background-color: var(--color-background-float);
    border-radius: var(--border-radius-small);
    height: fit-content;
    gap: 1.5rem;
  }

  .threads {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .author {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
  }
  .reactions {
    display: flex;
    gap: 0.5rem;
    height: 22px;
    margin-top: 1rem;
  }
  .open {
    color: var(--color-fill-success);
  }
  .closed {
    color: var(--color-foreground-red);
  }

  @media (max-width: 960px) {
    .issue {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }
    .metadata {
      display: none;
    }
  }
</style>

<Layout {baseUrl} {project} {tracking} activeTab="issues">
  <div class="issue">
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
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
            <Icon name="issue" />
          </div>
        </svelte:fragment>
        <svelte:fragment slot="state">
          {#if issue.state.status === "open"}
            <Badge size="small" variant="positive">
              {issue.state.status}
            </Badge>
          {:else}
            <Badge size="small" variant="negative">
              {issue.state.status} as
              {issue.state.reason}
            </Badge>
          {/if}
        </svelte:fragment>
        <div slot="description">
          <Markdown
            content={issue.discussion[0].body}
            rawPath={utils.getRawBasePath(project.id, baseUrl, project.head)} />
          <div class="reactions">
            {#if $httpdStore.state === "authenticated"}
              <ReactionSelector
                nid={$httpdStore.session.publicKey}
                reactions={issueReactions}
                on:select={async event => {
                  await handleReaction({ ...event.detail, id: issue.id });
                }} />
            {/if}
            {#if issueReactions.size > 0}
              <Reactions
                clickable={$httpdStore.state === "authenticated"}
                reactions={issueReactions}
                on:remove={event =>
                  handleReaction({ ...event.detail, id: issue.id })} />
            {/if}
          </div>
        </div>
        <div class="author" slot="author">
          opened by <NodeId
            nodeId={issue.author.id}
            alias={issue.author.alias} />
          {utils.formatTimestamp(issue.discussion[0].timestamp)}
        </div>
      </CobHeader>
      {#if threads.length > 0}
        <div class="threads">
          {#each threads as thread (thread.root.id)}
            <ThreadComponent
              enableAttachments
              {thread}
              {rawPath}
              on:reply={createReply}
              on:react={event => handleReaction(event.detail)} />
          {/each}
        </div>
      {/if}
      {#if $httpdStore.state === "authenticated"}
        <CommentTextarea
          enableAttachments
          on:submit={async event => {
            await createComment(event.detail.comment, event.detail.embeds);
          }} />
        <div style:display="flex">
          <CobStateButton
            items={items.filter(([, state]) => !isEqual(state, issue.state))}
            {selectedItem}
            state={issue.state}
            on:saveStatus={saveStatus} />
        </div>
      {/if}
    </div>
    <div class="metadata">
      <AssigneeInput
        {action}
        assignees={issue.assignees}
        on:save={saveAssignees} />
      <LabelInput {action} labels={issue.labels} on:save={saveLabels} />
      <Embeds {embeds} />
    </div>
  </div>
</Layout>
