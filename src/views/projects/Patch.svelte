<script lang="ts" context="module">
  import type {
    Comment,
    Review,
    Merge,
    Project,
    LifecycleState,
    PatchState,
    Revision,
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
  import type { BaseUrl, Embed, Patch } from "@httpd-client";
  import type { PatchView } from "./router";
  import type { Route } from "@app/lib/router";
  import type { ComponentProps } from "svelte";
  import type { Session } from "@app/lib/httpd";

  import * as modal from "@app/lib/modal";
  import * as role from "@app/lib/roles";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import capitalize from "lodash/capitalize";
  import isEqual from "lodash/isEqual";
  import partial from "lodash/partial";
  import uniqBy from "lodash/uniqBy";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";
  import { parseEmbedIntoMap } from "@app/lib/file";

  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import Changeset from "@app/views/projects/Changeset.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import CommentToggleInput from "@app/components/CommentToggleInput.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import Embeds from "@app/views/projects/Cob/Embeds.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Popover, { closeFocused } from "@app/components/Popover.svelte";
  import Radio from "@app/components/Radio.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";
  import RevisionComponent from "@app/views/projects/Cob/Revision.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import Share from "./Share.svelte";

  export let baseUrl: BaseUrl;
  export let patch: Patch;
  export let rawPath: (commit?: string) => string;
  export let project: Project;
  export let view: PatchView;
  export let preferredSeeds: string[];
  export let publicExplorer: string;

  $: api = new HttpdClient(baseUrl);

  const items: [string, LifecycleState][] = [
    ["Reopen patch", { status: "open" }],
    ["Archive patch", { status: "archived" }],
    ["Convert to draft", { status: "draft" }],
  ];

  async function editPatch(sessionId: string, title: string) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        { type: "edit", title, target: "delegates" },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch title editing failed",
            subtitle: [
              "There was an error while updating the title of this patch.",
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

  async function editRevision(
    sessionId: string,
    revisionId: string,
    description: string,
    embeds: Embed[],
  ) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        { type: "revision.edit", revision: revisionId, description, embeds },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Revision editing failed",
            subtitle: [
              "There was an error while updating the revision.",
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

  async function reactOnComment(
    session: Session,
    revisionId: string,
    commentId: string,
    authors: string[],
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
          active: authors.includes(session.publicKey) ? false : true,
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

  async function reactOnRevision(
    session: Session,
    revisionId: string,
    authors: string[],
    reaction: string,
  ) {
    try {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.react",
          revision: revisionId,
          reaction,
          active: authors.includes(session.publicKey) ? false : true,
        },
        session.id,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Reacting on revision failed",
            subtitle: [
              "There was an error while trying to react to a revision.",
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

  let patchState: State = "read";
  let labelState: State = "read";

  let revisionId: string;
  $: if (view.name === "diff") {
    revisionId = patch.revisions[patch.revisions.length - 1].id;
  } else {
    revisionId = view.revision;
  }

  $: uniqueEmbeds = uniqBy(
    patch.revisions.flatMap(({ discussions }) =>
      discussions.flatMap(comment => comment.embeds),
    ),
    "content",
  );
  $: description = patch.revisions[0].description;
  $: lastEdit = patch.revisions[0].edits.at(-1);
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
        revisionEdits: Revision["edits"];
        revisionReactions: Revision["reactions"];
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
      revisionEdits: rev.edits,
      revisionReactions: rev.reactions,
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
  $: firstRevision = timelineTuple[0][0];
  $: session =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? $httpdStore.session
      : undefined;
</script>

<style>
  .patch {
    display: flex;
    flex: 1;
    min-height: 100%;
  }
  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    background-color: var(--color-background-float);
  }
  .metadata {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-size: var(--font-size-small);
    padding: 1rem;
    border-left: 1px solid var(--color-border-hint);
    border-left: 1px solid var(--color-border-hint);
    width: 20rem;
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-large);
    height: 2.5rem;
  }
  .bottom {
    background-color: var(--color-background-default);
    padding: 1rem;
    height: 100%;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  .tabs {
    font-size: var(--font-size-tiny);
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    position: relative;
    margin-top: 1rem;
    box-shadow: inset 0 -1px 0 var(--color-border-hint);
  }
  .tabs-spacer {
    width: 1rem;
    height: 100%;
  }
  .author {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
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
  .author-metadata {
    color: var(--color-fill-gray);
    font-size: var(--font-size-small);
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
    flex-direction: column;
    width: 100%;
  }
  .diff-button-range {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-bold);
  }
  .connector {
    width: 1px;
    height: 1.5rem;
    margin-left: 1rem;
    background-color: var(--color-fill-separator);
  }
  @media (max-width: 720px) {
    .patch {
      display: block;
    }
  }
</style>

<Layout {baseUrl} {project} activeTab="patches">
  <div class="patch">
    <div class="main">
      <CobHeader>
        <svelte:fragment slot="title">
          <div
            style="display: flex; align-items: center; gap: 1rem; width: 100%;">
            {#if patchState !== "read"}
              <TextInput
                placeholder="Title"
                bind:value={patch.title}
                showKeyHint={false} />
            {:else if !patch.title}
              <span class="txt-missing">No title</span>
            {:else}
              <div class="title">
                <InlineMarkdown
                  stripEmphasizedStyling
                  fontSize="large"
                  content={patch.title} />
              </div>
            {/if}
          </div>
          {#if session && role.isDelegateOrAuthor(session.publicKey, project.delegates, patch.author.id) && patchState === "read"}
            <Button
              variant="outline"
              title="edit patch"
              on:click={() => (patchState = "edit")}>
              <IconSmall name={"edit"} />
              Edit
            </Button>
          {/if}
          {#if patchState === "read"}
            <Share {preferredSeeds} {publicExplorer} {baseUrl} />
            {#if session && role.isDelegateOrAuthor(session.publicKey, project.delegates, patch.author.id)}
              <CobStateButton
                items={items.filter(
                  ([, state]) => !isEqual(state, patch.state),
                )}
                {selectedItem}
                state={patch.state}
                save={partial(saveStatus, session.id)} />
            {/if}
          {/if}
        </svelte:fragment>
        <svelte:fragment slot="state">
          <Badge size="tiny" variant={badgeColor(patch.state.status)}>
            <IconSmall name="patch" />
            {capitalize(patch.state.status)}
          </Badge>
        </svelte:fragment>
        <svelte:fragment slot="description">
          <div class="revision-description">
            {#if session && patchState !== "read" && lastEdit}
              <ExtendedTextarea
                isValid={() => patch.title.length > 0}
                enableAttachments
                embeds={parseEmbedIntoMap(lastEdit.embeds)}
                rawPath={rawPath(patch.revisions[0].id)}
                body={newDescription}
                submitCaption="Save"
                submitInProgress={patchState === "submit"}
                placeholder="Leave a description"
                on:close={() => {
                  patchState = "read";
                  void refreshPatch();
                }}
                on:submit={async ({ detail: { comment, embeds } }) => {
                  patchState = "submit";
                  if (session) {
                    try {
                      await editPatch(session.id, patch.title);
                      await editRevision(
                        session.id,
                        patch.id,
                        comment,
                        Array.from(embeds.values()),
                      );
                    } finally {
                      patchState = "read";
                    }
                  }
                }} />
            {:else if description}
              <Markdown content={description} rawPath={rawPath(patch.id)} />
            {:else}
              <span class="txt-missing">No description available</span>
            {/if}
            {#if session || (firstRevision.revisionReactions && firstRevision.revisionReactions.length > 0)}
              <div class="actions">
                {#if session}
                  <ReactionSelector
                    reactions={firstRevision.revisionReactions}
                    on:select={async ({ detail: { emoji, authors } }) => {
                      if (session) {
                        try {
                          await reactOnRevision(
                            session,
                            patch.id,
                            authors,
                            emoji,
                          );
                        } finally {
                          closeFocused();
                        }
                      }
                    }} />
                {/if}
                {#if firstRevision.revisionReactions.length > 0}
                  <Reactions
                    handleReaction={session &&
                      partial(reactOnRevision, session, patch.id)}
                    reactions={firstRevision.revisionReactions} />
                {/if}
              </div>
            {/if}
          </div>
        </svelte:fragment>
        <div class="author" slot="author">
          <NodeId nodeId={patch.author.id} alias={patch.author.alias} />
          opened
          <span class="global-oid">{utils.formatObjectId(patch.id)}</span>
          <span title={utils.absoluteTimestamp(patch.revisions[0].timestamp)}>
            {utils.formatTimestamp(patch.revisions[0].timestamp)}
          </span>
          {#if lastEdit}
            <div class="author-metadata">•</div>
            <div
              class="author-metadata"
              title={utils.formatEditedCaption(
                lastEdit.author,
                lastEdit.timestamp,
              )}>
              edited
            </div>
          {/if}
        </div>
      </CobHeader>

      <div class="tabs">
        <div class="tabs-spacer" />
        <Radio styleGap="0.375rem">
          {#each Object.entries(tabs) as [name, { route, icon }]}
            <Link {route}>
              <Button
                size="large"
                variant={name === view.name ? "tab-active" : "tab"}>
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
              <Button size="large" variant="tab-active">
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

        <div style="margin-left: auto; margin-top: -0.5rem;">
          {#if view.name === "changes"}
            <div style="margin-left: auto; ">
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
                  <span style:color="var(--color-foreground-contrast)">
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
                          style:color={item.id === view.revision
                            ? "var(--color-foreground-contrast)"
                            : "var(--color-fill-gray)"}>
                          Revision
                        </span>
                        <span
                          style:color="var(--color-fill-secondary)"
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
        <div class="tabs-spacer" />
      </div>
      <div class="bottom">
        {#if view.name === "diff"}
          <Changeset
            {baseUrl}
            projectId={project.id}
            revision={view.toCommit}
            files={view.files}
            diff={view.diff} />
        {:else if view.name === "activity"}
          {#each timelineTuple as [revision, timelines], index}
            {@const previousRevision =
              index > 0 ? patch.revisions[index - 1] : undefined}
            <RevisionComponent
              {baseUrl}
              {rawPath}
              projectId={project.id}
              {timelines}
              projectDefaultBranch={project.defaultBranch}
              projectHead={project.head}
              {...revision}
              first={index === 0}
              canEdit={partial(
                role.isDelegateOrAuthor,
                session?.publicKey,
                project.delegates,
              )}
              editRevision={session &&
                partial(editRevision, session.id, revision.revisionId)}
              editComment={session &&
                partial(editComment, session.id, revision.revisionId)}
              reactOnComment={session &&
                partial(reactOnComment, session, revision.revisionId)}
              reactOnRevision={session &&
                partial(reactOnRevision, session, revision.revisionId)}
              createReply={session &&
                partial(createReply, session.id, revision.revisionId)}
              patchId={patch.id}
              patchState={patch.state}
              initiallyExpanded={index === patch.revisions.length - 1}
              previousRevId={previousRevision?.id}
              previousRevOid={previousRevision?.oid}>
              {#if index === patch.revisions.length - 1}
                {#if session && view.name === "activity"}
                  <div class="connector" />
                  <CommentToggleInput
                    rawPath={rawPath(patch.revisions[0].id)}
                    focus
                    enableAttachments
                    placeholder="Leave your comment"
                    submit={partial(
                      createComment,
                      session.id,
                      revision.revisionId,
                    )} />
                  {#if role.isDelegateOrAuthor(session.publicKey, project.delegates, patch.author.id)}
                    <div class="connector" />
                    <div style="display: flex;">
                      <CobStateButton
                        items={items.filter(
                          ([, state]) => !isEqual(state, patch.state),
                        )}
                        {selectedItem}
                        state={patch.state}
                        save={partial(saveStatus, session.id)} />
                    </div>
                  {/if}
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
        {:else if view.name === "changes"}
          <Changeset
            {baseUrl}
            projectId={project.id}
            revision={view.oid}
            files={view.files}
            diff={view.diff} />
        {:else}
          {utils.unreachable(view)}
        {/if}
      </div>
    </div>

    <div class="metadata global-hide-on-mobile">
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
      <Embeds embeds={uniqueEmbeds} />
    </div>
  </div>
</Layout>
