<script lang="ts">
  import type { Reaction } from "@http-client/lib/project/comment";
  import type {
    BaseUrl,
    Comment,
    Embed,
    Issue,
    IssueState,
    Project,
    Node,
  } from "@http-client";
  import type { Session } from "@app/lib/httpd";

  import capitalize from "lodash/capitalize";
  import isEqual from "lodash/isEqual";
  import uniqBy from "lodash/uniqBy";
  import partial from "lodash/partial";

  import * as modal from "@app/lib/modal";
  import * as role from "@app/lib/roles";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { experimental } from "@app/lib/appearance";
  import { HttpdClient } from "@http-client";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { httpdStore } from "@app/lib/httpd";
  import { parseEmbedIntoMap } from "@app/lib/file";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import CommentToggleInput from "@app/components/CommentToggleInput.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import Embeds from "@app/views/projects/Cob/Embeds.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import LabelInput from "./Cob/LabelInput.svelte";
  import Layout from "./Layout.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";
  import Share from "@app/views/projects/Share.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import ThreadComponent from "@app/components/Thread.svelte";

  export let baseUrl: BaseUrl;
  export let node: Node;
  export let issue: Issue;
  export let project: Project;
  export let rawPath: (commit?: string) => string;

  const api = new HttpdClient(baseUrl);

  const items: [string, IssueState][] = [
    ["Reopen issue", { status: "open" }],
    ["Close issue as solved", { status: "closed", reason: "solved" }],
    ["Close issue as other", { status: "closed", reason: "other" }],
  ];

  async function createReply(
    sessionId: string,
    replyTo: string,
    body: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "comment", body, embeds, replyTo },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Comment reply creation failed",
            subtitle: [
              "There was an error while creating this reply.",
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
      await refreshIssue();
    }
  }

  async function createComment(
    sessionId: string,
    body: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "comment", body, embeds, replyTo: issue.id },
        sessionId,
      );
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Comment creation failed",
            subtitle: [
              "There was an error while creating this comment.",
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
      await refreshIssue();
    }
  }

  async function editComment(
    sessionId: string,
    id: string,
    body: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "comment.edit", id, body, embeds },
        sessionId,
      );
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
      await refreshIssue();
    }
  }

  async function reactOnComment(
    session: Session,
    commentId: string,
    authors: Comment["reactions"][0]["authors"],
    reaction: string,
  ) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        {
          type: "comment.react",
          id: commentId,
          reaction,
          active: !authors.find(
            ({ id }) => utils.parseNodeId(id)?.pubkey === session.publicKey,
          ),
        },
        session.id,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Editing reactions failed",
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
      await refreshIssue();
    }
  }

  async function editIssue(
    sessionId: string,
    title: string,
    id: string,
    body: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "edit", title },
        sessionId,
      );
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "comment.edit", id, body, embeds },
        sessionId,
      );
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
            error: {
              message: error.message,
              stack: error.stack,
            },
          },
        });
      }
    } finally {
      await refreshIssue();
    }
  }

  async function saveLabels(labels: string[]) {
    try {
      if (session) {
        labelState = "submit";
        await api.project.updateIssue(
          project.id,
          issue.id,
          { type: "label", labels },
          session.id,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue labels editing failed",
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
      labelState = "read";
      await refreshIssue();
    }
  }

  async function saveAssignees(assignees: Reaction["authors"]) {
    try {
      if (session) {
        assigneeState = "submit";
        await api.project.updateIssue(
          project.id,
          issue.id,
          { type: "assign", assignees: assignees.map(({ id }) => id) },
          session.id,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue assignees editing failed",
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
      assigneeState = "read";
      await refreshIssue();
    }
  }

  async function saveStatus(sessionId: string, state: IssueState) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "lifecycle", state },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue status editing failed",
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
      void router.push({
        resource: "project.issue",
        project: project.id,
        node: baseUrl,
        issue: issue.id,
      });
    }
  }

  // Refreshes the given issue by fetching it from the server.
  // If the fetch fails, the given issue is returned.
  async function refreshIssue() {
    try {
      issue = await api.project.getIssueById(project.id, issue.id);
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
    }
  }

  let newTitle = issue.title;
  let newDescription = issue.discussion[0].body;

  $: uniqueEmbeds = uniqBy(
    issue.discussion.flatMap(comment => comment.embeds),
    "content",
  );
  $: selectedItem = issue.state.status === "closed" ? items[0] : items[1];
  $: threads = issue.discussion
    .filter(
      comment =>
        (comment.id !== issue.discussion[0].id && !comment.replyTo) ||
        comment.replyTo === issue.discussion[0].id,
    )
    .map(thread => {
      return {
        root: thread,
        replies: issue.discussion
          .filter(comment => comment.replyTo === thread.id)
          .sort((a, b) => a.timestamp - b.timestamp),
      };
    }, []);
  $: session =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? $httpdStore.session
      : undefined;
  $: lastDescriptionEdit =
    issue.discussion[0].edits.length > 1
      ? issue.discussion[0].edits.at(-1)
      : undefined;
  $: delegates = project.delegates.map(d => d.id);

  type State = "read" | "edit" | "submit";

  let assigneeState: State = "read";
  let labelState: State = "read";
  let issueState: State = "read";
</script>

<style>
  .issue {
    display: flex;
    flex: 1;
    min-height: 100%;
  }
  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    background-color: var(--color-background-float);
  }
  .bottom {
    padding: 0 1rem 2.5rem 1rem;
    background-color: var(--color-background-default);
    height: 100%;
    border-top: 1px solid var(--color-border-hint);
  }
  .connector {
    width: 1px;
    height: 1.5rem;
    margin-left: 1.25rem;
    background-color: var(--color-fill-separator);
  }
  .metadata {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border-left: 1px solid var(--color-border-hint);
    gap: 1.5rem;
    width: 20rem;
  }

  .threads {
    display: flex;
    flex-direction: column;
  }

  .author-metadata {
    color: var(--color-fill-gray);
    font-size: var(--font-size-small);
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-large);
    word-break: break-word;
  }
  .reactions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: -0.25rem;
  }
  @media (max-width: 719.98px) {
    .bottom {
      padding: 0;
    }
  }
</style>

<Layout {node} {baseUrl} {project} activeTab="issues" stylePaddingBottom="0">
  <div class="issue">
    <div class="main">
      <CobHeader>
        <svelte:fragment slot="title">
          <div style="display: flex; gap: 1rem; width: 100%;">
            {#if issueState !== "read"}
              <TextInput
                placeholder="Title"
                bind:value={newTitle}
                showKeyHint={false} />
            {:else if !issue.title}
              <span class="txt-missing">No title</span>
            {:else}
              <div class="title">
                <InlineMarkdown
                  stripEmphasizedStyling
                  fontSize="large"
                  content={newTitle} />
              </div>
            {/if}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            {#if $experimental && session && role.isDelegateOrAuthor(session.publicKey, delegates, issue.author.id) && issueState === "read"}
              <div class="global-hide-on-mobile-down">
                <Button
                  variant="outline"
                  title="edit issue"
                  on:click={() => (issueState = "edit")}>
                  <IconSmall name={"edit"} />
                  Edit
                </Button>
              </div>
            {/if}
            {#if issueState === "read"}
              <Share {baseUrl} />
              {#if $experimental && session && role.isDelegateOrAuthor(session.publicKey, delegates, issue.author.id)}
                <div class="global-hide-on-small-desktop-down">
                  <CobStateButton
                    items={items.filter(
                      ([, state]) => !isEqual(state, issue.state),
                    )}
                    {selectedItem}
                    state={issue.state}
                    save={partial(saveStatus, session.id)} />
                </div>
              {/if}
            {/if}
          </div>
        </svelte:fragment>
        <svelte:fragment slot="state">
          {#if issue.state.status === "open"}
            <Badge size="tiny" variant="positive">
              <IconSmall name="issue" />
              {capitalize(issue.state.status)}
            </Badge>
          {:else}
            <Badge size="tiny" variant="negative">
              <IconSmall name="issue" />
              {capitalize(issue.state.status)} as
              {issue.state.reason}
            </Badge>
          {/if}
          <NodeId
            stylePopoverPositionLeft="-13px"
            nodeId={issue.author.id}
            alias={issue.author.alias} />
          opened
          <CopyableId id={issue.id} style="oid">
            {utils.formatObjectId(issue.id)}
          </CopyableId>
          <span title={utils.absoluteTimestamp(issue.discussion[0].timestamp)}>
            {utils.formatTimestamp(issue.discussion[0].timestamp)}
          </span>
          {#if lastDescriptionEdit}
            <div
              class="author-metadata"
              title={utils.formatEditedCaption(
                lastDescriptionEdit.author,
                lastDescriptionEdit.timestamp,
              )}>
              • edited
            </div>
          {/if}
        </svelte:fragment>
        <div slot="subtitle" class="global-hide-on-desktop-up">
          <div
            style:margin-top="2rem"
            style="display: flex; flex-direction: column; gap: 0.5rem;">
            <AssigneeInput
              locallyAuthenticated={role.isDelegate(
                session?.publicKey,
                delegates,
              )}
              assignees={issue.assignees}
              submitInProgress={assigneeState === "submit"}
              on:save={({ detail: newAssignees }) => {
                void saveAssignees(newAssignees);
              }} />
            <LabelInput
              locallyAuthenticated={role.isDelegate(
                session?.publicKey,
                delegates,
              )}
              labels={issue.labels}
              submitInProgress={labelState === "submit"}
              on:save={({ detail: newLabels }) => void saveLabels(newLabels)} />
            <Embeds embeds={uniqueEmbeds} />
          </div>
        </div>
        <svelte:fragment slot="description">
          {#if $experimental && issueState !== "read"}
            <ExtendedTextarea
              isValid={() => newTitle.length > 0}
              disallowEmptyBody
              rawPath={rawPath(project.head)}
              enableAttachments
              embeds={parseEmbedIntoMap(issue.discussion[0].embeds)}
              body={newDescription}
              submitCaption="Save"
              submitInProgress={issueState === "submit"}
              placeholder="Leave a description"
              on:close={() => {
                issueState = "read";
                newTitle = issue.title;
                newDescription = issue.discussion[0].body;
              }}
              on:submit={async ({ detail: { comment, embeds } }) => {
                if (session) {
                  try {
                    issueState = "submit";
                    await editIssue(
                      session.id,
                      newTitle,
                      issue.id,
                      comment,
                      Array.from(embeds.values()),
                    );
                    newDescription = comment;
                  } finally {
                    issueState = "read";
                  }
                }
              }} />
          {:else if issue.discussion[0].body}
            <Markdown
              breaks
              content={issue.discussion[0].body}
              rawPath={rawPath(project.head)} />
          {:else}
            <span class="txt-missing">No description</span>
          {/if}
          <div class="reactions">
            {#if $experimental && session}
              <div class="global-hide-on-mobile-down">
                <ReactionSelector
                  reactions={issue.discussion[0].reactions}
                  on:select={async ({ detail: { authors, emoji } }) => {
                    try {
                      if (session) {
                        await reactOnComment(session, issue.id, authors, emoji);
                      }
                    } finally {
                      closeFocused();
                    }
                  }} />
              </div>
            {/if}
            {#if issue.discussion[0].reactions.length > 0}
              <Reactions
                reactions={issue.discussion[0].reactions}
                handleReaction={session &&
                  partial(reactOnComment, session, issue.id)} />
            {/if}
          </div>
        </svelte:fragment>
      </CobHeader>
      <div class="bottom">
        {#if threads.length > 0}
          <div class="connector" />
          <div class="threads">
            {#each threads as thread, i (thread.root.id)}
              <ThreadComponent
                enableAttachments
                {thread}
                rawPath={rawPath(project.head)}
                canEditComment={partial(
                  role.isDelegateOrAuthor,
                  session?.publicKey,
                  delegates,
                )}
                editComment={$experimental &&
                  session &&
                  partial(editComment, session.id)}
                createReply={$experimental &&
                  session &&
                  partial(createReply, session.id)}
                reactOnComment={$experimental &&
                  session &&
                  partial(reactOnComment, session)} />
              {#if i < threads.length - 1}
                <div class="connector" />
              {/if}
            {/each}
          </div>
        {/if}
        {#if $experimental && session}
          <div class="global-hide-on-mobile-down">
            <div class="connector" />
            <CommentToggleInput
              focus
              rawPath={rawPath(project.head)}
              placeholder="Leave your comment"
              enableAttachments
              submit={partial(createComment, session.id)} />
            <div
              style="display:flex; flex-direction: column; align-items: flex-start;">
              {#if role.isDelegateOrAuthor(session.publicKey, delegates, issue.author.id)}
                <div class="connector" />
                <CobStateButton
                  items={items.filter(
                    ([, state]) => !isEqual(state, issue.state),
                  )}
                  {selectedItem}
                  state={issue.state}
                  save={partial(saveStatus, session.id)} />
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
    <div class="metadata global-hide-on-medium-desktop-down">
      <AssigneeInput
        locallyAuthenticated={Boolean(
          role.isDelegate(session?.publicKey, delegates),
        )}
        assignees={issue.assignees}
        submitInProgress={assigneeState === "submit"}
        on:save={({ detail: newAssignees }) => {
          void saveAssignees(newAssignees);
        }} />
      <LabelInput
        locallyAuthenticated={Boolean(
          role.isDelegate(session?.publicKey, delegates),
        )}
        labels={issue.labels}
        submitInProgress={labelState === "submit"}
        on:save={({ detail: newLabels }) => void saveLabels(newLabels)} />
      <Embeds embeds={uniqueEmbeds} />
    </div>
  </div>
</Layout>
