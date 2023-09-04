<script lang="ts">
  import type { BaseUrl, Issue, IssueState, Project } from "@httpd-client";
  import type { IssueUpdateAction } from "@httpd-client/lib/project/issue";
  import type { Session } from "@app/lib/httpd";

  import { isEqual } from "lodash";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { ResponseError } from "@httpd-client/lib/fetcher";
  import { embed } from "@app/lib/file";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import Embeds from "@app/views/projects/Cob/Embeds.svelte";
  import ErrorModal from "@app/views/projects/Cob/ErrorModal.svelte";
  import Floating, { closeFocused } from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import ThreadComponent from "@app/components/Thread.svelte";

  export let baseUrl: BaseUrl;
  export let issue: Issue;
  export let project: Project;

  const rawPath = utils.getRawBasePath(project.id, baseUrl, project.head);
  const api = new HttpdClient(baseUrl);

  let newEmbeds: { name: string; content: string }[] = [];
  let selectionStart = 0;
  let selectionEnd = 0;
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

  const MAX_BLOB_SIZE = 4_194_304;

  function handleFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const embeds = Array.from(event.dataTransfer.files).map(embed);
      void Promise.all(embeds).then(embeds =>
        embeds.forEach(embed => {
          if (embed.content.length > MAX_BLOB_SIZE) {
            modal.show({
              component: ErrorModal,
              props: {
                title: "File too large",
                subtitle: [
                  "The file you tried to upload is too large.",
                  "The maximum file size is 4MB.",
                ],
                error: { message: `File ${embed.name} is too large` },
              },
            });
            return;
          }
          newEmbeds.push({ name: embed.name, content: embed.content });
          const embedText = `![${embed.name}](${embed.oid})\n`;
          commentBody = commentBody
            .slice(0, selectionStart)
            .concat(embedText, commentBody.slice(selectionEnd));
          selectionStart += embedText.length;
          selectionEnd = selectionStart;
        }),
      );
    }
  }

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

  async function createComment(body: string) {
    if ($httpdStore.state === "authenticated" && body.trim().length > 0) {
      const status = await updateIssue(
        project.id,
        issue.id,
        {
          type: "comment",
          body,
          embeds: newEmbeds,
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

  let commentBody: string = "";
</script>

<style>
  .issue {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
    padding: 1rem 2rem 0 8rem;
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
  .reactions {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: row;
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
  .reaction-selector {
    position: absolute;
    bottom: 2rem;
    left: 0;
  }
  .toggle {
    margin-top: 1rem;
  }
  .toggle:hover {
    color: var(--color-foreground-5);
    cursor: pointer;
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

<Layout {baseUrl} {project} activeTab="issues">
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
            <Icon name="issue" />
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
            content={issue.discussion[0].body}
            rawPath={utils.getRawBasePath(project.id, baseUrl, project.head)} />
          <div class="reactions">
            {#if $httpdStore.state === "authenticated"}
              <Floating>
                <div class="reaction-selector" slot="modal">
                  <ReactionSelector
                    nid={$httpdStore.session.publicKey}
                    reactions={issueReactions}
                    on:select={async event => {
                      await handleReaction({ ...event.detail, id: issue.id });
                      closeFocused();
                    }} />
                </div>
                <div class="toggle" slot="toggle">
                  <Icon name="face" />
                </div>
              </Floating>
            {/if}
            {#if issueReactions.size > 0}
              <div style:margin-top="1rem">
                <Reactions
                  reactions={issueReactions}
                  on:remove={event =>
                    handleReaction({ ...event.detail, id: issue.id })} />
              </div>
            {/if}
          </div>
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
            {thread}
            {rawPath}
            on:reply={createReply}
            on:react={event => handleReaction(event.detail)} />
        </div>
      {/each}
      {#if $httpdStore.state === "authenticated"}
        <div style:margin-top="1rem">
          <Textarea
            resizable
            bind:selectionStart
            bind:selectionEnd
            on:drop={handleFileDrop}
            on:submit={async () => {
              await createComment(commentBody);
              newEmbeds = [];
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
                newEmbeds = [];
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
      <LabelInput {action} labels={issue.labels} on:save={saveLabels} />
      <Embeds {embeds} />
    </div>
  </div>
</Layout>
