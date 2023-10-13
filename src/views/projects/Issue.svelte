<script lang="ts">
  import type { BaseUrl, Issue, IssueState, Project } from "@httpd-client";
  import type { Embed } from "@app/lib/file";
  import type { IssueUpdateAction } from "@httpd-client/lib/project/issue";
  import type { Session } from "@app/lib/httpd";

  import { isEqual, uniqBy } from "lodash";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { ResponseError } from "@httpd-client/lib/fetcher";
  import { authenticated, authenticatedLocal } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import Badge from "@app/components/Badge.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import CommentToggleInput from "@app/components/CommentToggleInput.svelte";
  import Embeds from "@app/views/projects/Cob/Embeds.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
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

  const items: [string, IssueState][] = [
    ["Reopen issue", { status: "open" }],
    ["Close issue as solved", { status: "closed", reason: "solved" }],
    ["Close issue as other", { status: "closed", reason: "other" }],
  ];

  async function createReply({
    detail: { body, embeds, id },
  }: CustomEvent<{
    id: string;
    embeds: Embed[];
    body: string;
  }>) {
    if ($authenticated && body.trim().length > 0) {
      const status = await updateIssue(
        project.id,
        issue.id,
        { type: "comment", body, embeds, replyTo: id },
        $authenticated.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
    }
  }

  async function createComment({
    detail: { comment, embeds },
  }: CustomEvent<{ comment: string; embeds: Embed[] }>) {
    if ($authenticated && comment.trim().length > 0) {
      const status = await updateIssue(
        project.id,
        issue.id,
        { type: "comment", body: comment, embeds, replyTo: issue.id },
        $authenticated.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
    }
  }

  async function editComment(id: string, body: string) {
    if ($authenticated && body.trim().length > 0) {
      try {
        if (issue.id === id) {
          saveDescriptionInProgress = true;
        } else {
          saveCommentInProgress = true;
        }
        const status = await updateIssue(
          project.id,
          issue.id,
          {
            type: "comment.edit",
            id,
            body,
            embeds: embeds[id],
          },
          $authenticated.session,
          api,
        );
        if (status === "success") {
          issue = await refreshIssue(project.id, issue, api);
        } else {
          // Reassigning issue.discussion overwrites the changed comment in Comment
          issue.discussion = issue.discussion;
        }
      } catch (error) {
        if (error instanceof Error) {
          modal.show({
            component: ErrorModal,
            props: {
              title: "Issue comment editing failed",
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
      } finally {
        editingIssueDescription = false;
        saveDescriptionInProgress = false;
        saveCommentInProgress = false;
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
    if ($authenticated) {
      try {
        const status = await updateIssue(
          project.id,
          issue.id,
          {
            type: "comment.react",
            id,
            reaction,
            active: nids.includes($authenticated.session.publicKey)
              ? false
              : true,
          },
          $authenticated.session,
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
    if ($authenticated && title.trim().length > 0 && title !== issue.title) {
      try {
        saveTitleInProgress = true;
        const status = await updateIssue(
          project.id,
          issue.id,
          { type: "edit", title },
          $authenticated.session,
          api,
        );
        if (status === "success") {
          issue = await refreshIssue(project.id, issue, api);
        }
        issue.title = issue.title;
      } catch (error) {
        if (error instanceof Error) {
          modal.show({
            component: ErrorModal,
            props: {
              title: "Issue title editing failed",
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
      } finally {
        saveTitleInProgress = false;
      }
    } else {
      // Reassigning issue.title overwrites the invalid title in IssueHeader
      issue.title = issue.title;
    }
  }

  async function saveLabels({ detail: labels }: CustomEvent<string[]>) {
    if ($authenticated) {
      if (isEqual(issue.labels, labels)) {
        return;
      }
      const status = await updateIssue(
        project.id,
        issue.id,
        { type: "label", labels },
        $authenticated.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      } else {
        // Reassigning issue overwrites the label changes.
        issue = issue;
      }
    }
  }

  async function saveAssignees({ detail: assignees }: CustomEvent<string[]>) {
    if ($authenticated) {
      if (isEqual(issue.assignees, assignees)) {
        return;
      }
      const status = await updateIssue(
        project.id,
        issue.id,
        { type: "assign", assignees },
        $authenticated.session,
        api,
      );
      if (status === "success") {
        issue = await refreshIssue(project.id, issue, api);
      }
    }
  }

  async function saveStatus({ detail: state }: CustomEvent<IssueState>) {
    if ($authenticated) {
      const status = await updateIssue(
        project.id,
        issue.id,
        { type: "lifecycle", state },
        $authenticated.session,
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
  let editingIssueDescription = false;

  $: embeds = issue.discussion.reduce(
    (acc, comment) => {
      acc[comment.id] = comment.embeds;
      return acc;
    },
    {} as Record<string, Embed[]>,
  );
  $: uniqueEmbeds = uniqBy(Object.values(embeds).flat(), "content");
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

  let saveDescriptionInProgress = false;
  let saveTitleInProgress = false;
  let saveCommentInProgress = false;
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
  .markdown {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
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
        locallyAuthenticated={$authenticatedLocal(baseUrl.hostname)}
        id={issue.id}
        title={issue.title}
        submitInProgress={saveTitleInProgress}
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
          {#if $authenticatedLocal(baseUrl.hostname) && editingIssueDescription}
            <ExtendedTextarea
              enableAttachments
              body={issue.discussion[0].body}
              submitCaption="Save"
              submitInProgress={saveDescriptionInProgress}
              placeholder="Leave a description"
              on:close={() => (editingIssueDescription = false)}
              on:submit={async ({ detail: { comment } }) => {
                void editComment(issue.id, comment);
              }} />
          {:else}
            <div class="markdown">
              <Markdown
                content={issue.discussion[0].body}
                rawPath={utils.getRawBasePath(
                  project.id,
                  baseUrl,
                  project.head,
                )} />
              <!-- TODO: Remove if statement once `radicle-httpd` fixes embed editing -->
              {#if issue.discussion[0].embeds.length === 0}
                <IconButton
                  title="edit description"
                  on:click={() => (editingIssueDescription = true)}>
                  <IconSmall name={"edit"} />
                </IconButton>
              {/if}
            </div>
          {/if}
          <div class="reactions">
            {#if $authenticated}
              <ReactionSelector
                nid={$authenticated.session.publicKey}
                reactions={issueReactions}
                on:select={event =>
                  handleReaction({ ...event.detail, id: issue.id })} />
            {/if}
            {#if issueReactions.size > 0}
              <Reactions
                clickable={Boolean($authenticated)}
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
              on:editComment={({ detail: { id, body } }) =>
                editComment(id, body)}
              on:reply={createReply}
              on:react={event => handleReaction(event.detail)} />
          {/each}
        </div>
      {/if}
      {#if $authenticated}
        <CommentToggleInput
          placeholder="Leave your comment"
          enableAttachments
          submitInProgress={saveCommentInProgress}
          on:submit={createComment} />
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
        locallyAuthenticated={$authenticatedLocal(baseUrl.hostname)}
        assignees={issue.assignees}
        on:save={saveAssignees} />
      <LabelInput
        locallyAuthenticated={$authenticatedLocal(baseUrl.hostname)}
        labels={issue.labels}
        on:save={saveLabels} />
      <Embeds embeds={uniqueEmbeds} />
    </div>
  </div>
</Layout>
