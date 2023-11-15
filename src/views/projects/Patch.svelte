<script lang="ts" context="module">
  import type {
    Comment,
    Review,
    Merge,
    Project,
    LifecycleState,
    PatchState,
  } from "@httpd-client";

  interface Thread {
    root: Comment;
    replies: Comment[];
  }

  interface TimelineReview {
    inner: [string, Review];
    type: "review";
    timestamp: number;
  }

  interface TimelineMerge {
    inner: Merge;
    type: "merge";
    timestamp: number;
  }

  interface TimelineThread {
    inner: Thread;
    type: "thread";
    timestamp: number;
  }

  export type Timeline = TimelineMerge | TimelineReview | TimelineThread;
</script>

<script lang="ts">
  import type { BaseUrl, Patch } from "@httpd-client";
  import type { Embed } from "@app/lib/file";
  import type { PatchView } from "./router";
  import type { Route } from "@app/lib/router";
  import type { ComponentProps } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as role from "@app/lib/roles";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { capitalize, isEqual, partial } from "lodash";
  import { httpdStore, type Session } from "@app/lib/httpd";

  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import Changeset from "@app/views/projects/Changeset.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import CommentToggleInput from "@app/components/CommentToggleInput.svelte";
  import CommitTeaser from "@app/views/projects/Commit/CommitTeaser.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Popover, { closeFocused } from "@app/components/Popover.svelte";
  import Radio from "@app/components/Radio.svelte";
  import RevisionComponent from "@app/views/projects/Cob/Revision.svelte";

  export let baseUrl: BaseUrl;
  export let patch: Patch;
  export let project: Project;
  export let view: PatchView;
  export let tracking: boolean;

  $: api = new HttpdClient(baseUrl);

  const items: [string, LifecycleState][] = [
    ["Reopen patch", { status: "open" }],
    ["Archive patch", { status: "archived" }],
    ["Convert to draft", { status: "draft" }],
  ];

  async function editTitle(sessionId: string, title: string) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "edit",
          title,
          target: "delegates",
        },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch title editing failed",
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
      await refreshPatch();
    }
  }

  async function editDescription(sessionId: string, description: string) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.edit",
          revision: patch.id,
          description,
        },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch description editing failed",
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
      await refreshPatch();
    }
  }

  async function createReply(
    sessionId: string,
    revisionId: string,
    replyTo: string,
    body: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.comment",
          revision: revisionId,
          body,
          embeds,
          replyTo,
        },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch comment reply creation failed",
            subtitle: [
              "There was an error while updating the patch.",
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
      await refreshPatch();
    }
  }

  async function handleReaction(
    session: Session,
    revisionId: string,
    commentId: string,
    nids: string[],
    reaction: string,
  ) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.comment.react",
          revision: revisionId,
          comment: commentId,
          reaction,
          active: nids.includes(session.publicKey) ? false : true,
        },
        session.id,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch comment reaction editing failed",
            subtitle: [
              "There was an error while updating the patch.",
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
      await refreshPatch();
    }
  }
  async function createComment(
    sessionId: string,
    revisionId: string,
    comment: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.comment",
          body: comment,
          embeds,
          revision: revisionId,
        },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch comment creation failed",
            subtitle: [
              "There was an error while updating the patch.",
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
      await refreshPatch();
    }
  }

  async function editComment(
    sessionId: string,
    revisionId: string,
    id: string,
    body: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.comment.edit",
          comment: id,
          body,
          revision: revisionId,
          embeds,
        },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch comment editing failed",
            subtitle: [
              "There was an error while updating the patch.",
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
      await refreshPatch();
    }
  }

  async function saveStatus(sessionId: string, state: PatchState) {
    try {
      if (state.status !== "merged") {
        await api.project.updatePatch(
          project.id,
          patch.id,
          { type: "lifecycle", state },
          sessionId,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch status change failed",
            subtitle: [
              "There was an error while updating the patch.",
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
        resource: "project.patch",
        project: project.id,
        node: baseUrl,
        patch: patch.id,
      });
    }
  }

  async function saveLabels(sessionId: string, labels: string[]) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        { type: "label", labels },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch label change failed",
            subtitle: [
              "There was an error while updating the patch.",
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
      await refreshPatch();
    }
  }

  // Refreshes the given patch by fetching it from the server.
  // If the fetch fails, the given patch is returned.
  async function refreshPatch() {
    try {
      patch = await api.project.getPatchById(project.id, patch.id);
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Unable to fetch patch",
            subtitle: [
              "There was an error while refreshing this patch.",
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

  function badgeColor(status: string): ComponentProps<Badge>["variant"] {
    if (status === "draft") {
      return "foreground";
    } else if (status === "open") {
      return "positive";
    } else if (status === "archived") {
      return "caution";
    } else if (status === "merged") {
      return "primary";
    } else {
      return "foreground";
    }
  }

  type Tab = "activity" | "changes";

  let tabs: Record<
    Tab,
    { icon: ComponentProps<IconSmall>["name"]; route: Route }
  >;
  $: {
    const baseRoute = {
      resource: "project.patch",
      project: project.id,
      node: baseUrl,
      patch: patch.id,
    } as const;
    // For cleaner URLs, we omit the the revision part when we link to the
    // latest revision.
    const latestRevisionId = patch.revisions[patch.revisions.length - 1].id;
    const revision = latestRevisionId === revisionId ? undefined : revisionId;
    tabs = {
      activity: {
        route: {
          ...baseRoute,
          view: { name: "activity" },
        },
        icon: "activity",
      },
      changes: {
        route: {
          ...baseRoute,
          view: { name: "changes", revision },
        },
        icon: "diff",
      },
    };
  }

  function computeReviews(patch: Patch) {
    const patchReviews: Record<string, { latest: boolean; review: Review }> =
      {};

    patch.revisions.forEach((rev, i) => {
      const latest = i === patch.revisions.length - 1;
      for (const review of rev.reviews) {
        patchReviews[review.author.id] = { latest, review };
      }
    });

    return patchReviews;
  }

  type State = "read" | "submit" | "edit";

  let descriptionState: State = "read";
  let labelState: State = "read";

  let revisionId: string;
  $: if (view.name === "diff") {
    revisionId = patch.revisions[patch.revisions.length - 1].id;
  } else {
    revisionId = view.revision;
  }

  $: description = patch.revisions[0].description;
  $: newDescription = description;
  $: patchReviews = computeReviews(patch);
  $: selectedItem = patch.state.status === "open" ? items[1] : items[0];
  $: timelineTuple = patch.revisions.map<
    [
      {
        revisionId: string;
        revisionTimestamp: number;
        revisionBase: string;
        revisionOid: string;
        revisionAuthor: { id: string; alias?: string | undefined };
        revisionDescription: string;
      },
      Timeline[],
    ]
  >(rev => [
    {
      revisionId: rev.id,
      revisionTimestamp: rev.timestamp,
      revisionBase: rev.base,
      revisionOid: rev.oid,
      revisionAuthor: rev.author,
      revisionDescription: rev.description,
    },
    [
      ...rev.reviews.map<TimelineReview>(review => ({
        timestamp: review.timestamp,
        type: "review",
        inner: [review.author.id, review],
      })),
      ...patch.merges
        .filter(merge => merge.revision === rev.id)
        .map<TimelineMerge>(inner => ({
          timestamp: inner.timestamp,
          type: "merge",
          inner,
        })),
      ...rev.discussions
        .filter(comment => !comment.replyTo)
        .map<TimelineThread>(thread => ({
          timestamp: thread.timestamp,
          type: "thread",
          inner: {
            root: thread,
            replies: rev.discussions
              .filter(comment => comment.replyTo === thread.id)
              .sort((a, b) => a.timestamp - b.timestamp),
          },
        })),
    ].sort((a, b) => a.timestamp - b.timestamp),
  ]);
  $: session =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? $httpdStore.session
      : undefined;
</script>

<style>
  .patch {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
  }
  .metadata {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-size: var(--font-size-small);
    padding: 1rem;
    margin-left: 3rem;
    border: 1px solid var(--color-border-hint);
    background-color: var(--color-background-float);
    border-radius: var(--border-radius-small);
    height: fit-content;
  }
  .commit-list {
    border: 1px solid var(--color-border-hint);
    border-radius: var(--border-radius-small);
    overflow: hidden;
    margin-top: 1rem;
  }
  .tabs {
    display: flex;
    margin: 3rem 0 1.5rem 0;
  }
  .author {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
  }
  .draft {
    color: var(--color-foreground-gray);
  }
  .open {
    color: var(--color-fill-success);
  }
  .archived {
    color: var(--color-foreground-yellow);
  }
  .merged {
    color: var(--color-fill-primary);
  }
  .metadata-section-header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
  }
  .metadata-section-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .review {
    color: var(--color-fill-gray);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .review-accept {
    color: var(--color-foreground-success);
  }
  .review-reject {
    color: var(--color-foreground-red);
  }
  .revision-description {
    display: flex;
    width: 100%;
  }
  .edit-buttons {
    display: flex;
    margin-left: auto;
    margin-top: auto;
    margin-bottom: auto;
  }
  .diff-button-range {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-bold);
  }
  .teaser-wrapper:not(:last-child) {
    border-bottom: 1px solid var(--color-border-hint);
  }
  .connector {
    width: 1px;
    height: 1.5rem;
    margin-left: 1rem;
    background-color: var(--color-fill-separator);
  }
  @media (max-width: 1092px) {
    .patch {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }
    .metadata {
      display: none;
    }
  }
</style>

<Layout {baseUrl} {project} {tracking} activeTab="patches">
  <div class="patch">
    <div>
      <CobHeader
        id={patch.id}
        title={patch.title}
        editTitle={session &&
          role.isDelegateOrAuthor(
            session.publicKey,
            project.delegates,
            patch.author.id,
          ) &&
          partial(editTitle, session.id)}
        on:refresh={refreshPatch}>
        <svelte:fragment slot="icon">
          <div
            class="state"
            class:draft={patch.state.status === "draft"}
            class:open={patch.state.status === "open"}
            class:merged={patch.state.status === "merged"}
            class:archived={patch.state.status === "archived"}>
            <Icon name="patch" />
          </div>
        </svelte:fragment>
        <svelte:fragment slot="state">
          <Badge size="small" variant={badgeColor(patch.state.status)}>
            {patch.state.status}
          </Badge>
        </svelte:fragment>
        <svelte:fragment slot="description">
          <div class="revision-description">
            {#if session && descriptionState !== "read"}
              <ExtendedTextarea
                body={newDescription}
                submitCaption="Save"
                submitInProgress={descriptionState === "submit"}
                placeholder="Leave a description"
                on:close={() => (descriptionState = "read")}
                on:submit={async ({ detail: { comment } }) => {
                  descriptionState = "submit";
                  if (session) {
                    try {
                      await editDescription(session.id, comment);
                    } finally {
                      descriptionState = "read";
                    }
                  }
                }} />
            {:else if description}
              <Markdown
                content={description}
                rawPath={utils.getRawBasePath(
                  project.id,
                  baseUrl,
                  patch.revisions[0].id,
                )} />
            {:else}
              <span class="txt-missing">No description available</span>
            {/if}
            {#if role.isDelegateOrAuthor(session?.publicKey, project.delegates, patch.author.id) && descriptionState === "read"}
              <div class="edit-buttons">
                <IconButton
                  title="edit description"
                  on:click={() => (descriptionState = "edit")}>
                  <IconSmall name={"edit"} />
                </IconButton>
              </div>
            {/if}
          </div>
        </svelte:fragment>
        <div class="author" slot="author">
          opened by <NodeId
            nodeId={patch.author.id}
            alias={patch.author.alias} />
          {utils.formatTimestamp(patch.revisions[0].timestamp)}
        </div>
      </CobHeader>

      <div class="tabs">
        <Radio>
          {#each Object.entries(tabs) as [name, { route, icon }]}
            <Link {route}>
              <Button
                styleBorderRadius="0"
                size="regular"
                variant={name === view.name ? "gray-white" : "dim"}>
                <IconSmall name={icon} />
                {capitalize(name)}
              </Button>
            </Link>
          {/each}
          {#if view.name === "diff"}
            <Link
              route={{
                resource: "project.patch",
                project: project.id,
                node: baseUrl,
                patch: patch.id,
                view: {
                  name: "diff",
                  fromCommit: view.fromCommit,
                  toCommit: view.toCommit,
                },
              }}>
              <Button styleBorderRadius="0" size="regular" variant="gray-white">
                Compare <span class="diff-button-range">
                  {view.fromCommit.substring(0, 6)}..{view.toCommit.substring(
                    0,
                    6,
                  )}
                </span>
              </Button>
            </Link>
          {/if}
        </Radio>

        <div style:margin-left="auto">
          {#if session && role.isDelegateOrAuthor(session.publicKey, project.delegates, patch.author.id) && view.name === "activity"}
            <CobStateButton
              items={items.filter(([, state]) => !isEqual(state, patch.state))}
              {selectedItem}
              state={patch.state}
              save={partial(saveStatus, session.id)} />
          {/if}
          {#if view.name === "commits" || view.name === "changes"}
            <div style="margin-left: auto;">
              <Popover
                popoverPadding="0"
                popoverPositionTop="2.5rem"
                popoverBorderRadius="var(--border-radius-small)">
                <Button
                  let:expanded
                  slot="toggle"
                  let:toggle
                  on:click={toggle}
                  size="regular"
                  disabled={patch.revisions.length === 1}>
                  <span
                    style:font-weight="var(--font-weight-regular)"
                    style:color="var(--color-fill-gray)">
                    Revision
                  </span>
                  <span
                    style:color="var(--color-fill-secondary)"
                    style:font-family="var(--font-family-monospace)">
                    {utils.formatObjectId(view.revision)}
                  </span>
                  <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
                </Button>
                <DropdownList slot="popover" items={patch.revisions}>
                  <svelte:fragment slot="item" let:item>
                    <Link
                      on:afterNavigate={closeFocused}
                      route={{
                        resource: "project.patch",
                        project: project.id,
                        node: baseUrl,
                        patch: patch.id,
                        view: {
                          name: view.name,
                          revision: item.id,
                        },
                      }}>
                      <DropdownListItem selected={item.id === view.revision}>
                        <span
                          style:font-weight="var(--font-weight-regular)"
                          style:color={item.id === view.revision
                            ? "var(--color-foreground-match-background)"
                            : "var(--color-fill-gray)"}>
                          Revision
                        </span>
                        <span
                          style:color={item.id === view.revision
                            ? "var(--color-foreground-match-background)"
                            : "var(--color-fill-secondary)"}
                          style:font-family="var(--font-family-monospace)">
                          {utils.formatObjectId(item.id)}
                        </span>
                      </DropdownListItem>
                    </Link>
                  </svelte:fragment>
                </DropdownList>
              </Popover>
            </div>
          {/if}
        </div>
      </div>
      {#if view.name === "diff"}
        <div style:margin-top="1rem">
          <Changeset
            {baseUrl}
            projectId={project.id}
            revision={view.toCommit}
            files={view.files}
            diff={view.diff} />
        </div>
      {:else if view.name === "activity"}
        {#each timelineTuple as [revision, timelines], index}
          {@const previousRevision =
            index > 0 ? patch.revisions[index - 1] : undefined}
          <RevisionComponent
            {baseUrl}
            projectId={project.id}
            {timelines}
            projectDefaultBranch={project.defaultBranch}
            projectHead={project.head}
            {...revision}
            first={index === 0}
            canEditComment={partial(
              role.isDelegateOrAuthor,
              session?.publicKey,
              project.delegates,
            )}
            editComment={session &&
              partial(editComment, session.id, revision.revisionId)}
            handleReaction={session &&
              partial(handleReaction, session, revision.revisionId)}
            createReply={session &&
              partial(createReply, session.id, revision.revisionId)}
            patchId={patch.id}
            patchState={patch.state}
            expanded={index === patch.revisions.length - 1}
            previousRevId={previousRevision?.id}
            previousRevOid={previousRevision?.oid}>
            {#if index === patch.revisions.length - 1}
              {#if session && view.name === "activity"}
                <div class="connector" />
                <CommentToggleInput
                  enableAttachments
                  placeholder="Leave your comment"
                  submit={partial(
                    createComment,
                    session.id,
                    revision.revisionId,
                  )} />
                <div class="connector" />
                <div style="display: flex;">
                  {#if role.isDelegateOrAuthor(session.publicKey, project.delegates, patch.author.id)}
                    <CobStateButton
                      items={items.filter(
                        ([, state]) => !isEqual(state, patch.state),
                      )}
                      {selectedItem}
                      state={patch.state}
                      save={partial(saveStatus, session.id)} />
                  {/if}
                </div>
              {/if}
            {/if}
          </RevisionComponent>
        {:else}
          <div style:margin="4rem 0">
            <Placeholder
              iconName="no-patches"
              caption="No activity on this patch yet" />
          </div>
        {/each}
      {:else if view.name === "commits"}
        <div class="commit-list">
          {#each view.commits as commit}
            <div class="teaser-wrapper">
              <CommitTeaser projectId={project.id} {baseUrl} {commit} />
            </div>
          {/each}
        </div>
      {:else if view.name === "changes"}
        <div style:margin-top="1rem">
          <Changeset
            {baseUrl}
            projectId={project.id}
            revision={view.oid}
            files={view.files}
            diff={view.diff} />
        </div>
      {:else}
        {utils.unreachable(view.name)}
      {/if}
    </div>

    <div class="metadata">
      <div>
        <div class="metadata-section-header">Reviews</div>
        <div class="metadata-section-body">
          {#each Object.values(patchReviews) as { latest, review }}
            <div class="review" class:txt-missing={!latest}>
              <span
                class:review-accept={review.verdict === "accept"}
                class:review-reject={review.verdict === "reject"}>
                {#if review.verdict === "accept"}
                  <IconSmall name="checkmark" />
                {:else if review.verdict === "reject"}
                  <IconSmall name="cross" />
                {:else}
                  <IconSmall name="chat" />
                {/if}
              </span>
              <NodeId nodeId={review.author.id} alias={review.author.alias} />
            </div>
          {:else}
            <div class="txt-missing">No reviews</div>
          {/each}
        </div>
      </div>
      <LabelInput
        locallyAuthenticated={role.isDelegate(
          session?.publicKey,
          project.delegates,
        )}
        submitInProgress={labelState === "submit"}
        labels={patch.labels}
        on:save={async ({ detail: newLabels }) => {
          if (session) {
            labelState = "submit";
            try {
              await saveLabels(session.id, newLabels);
            } finally {
              labelState = "read";
            }
          }
        }} />
    </div>
  </div>
</Layout>
