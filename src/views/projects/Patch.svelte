<script lang="ts" context="module">
  import type {
    Comment,
    Review,
    Merge,
    Project,
    LifecycleState,
    PatchState,
    Revision,
    Diff,
    Node,
  } from "@http-client";

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
  export type PatchReviews = Record<
    string,
    { latest: boolean; review: Review }
  >;
</script>

<script lang="ts">
  import type { BaseUrl, Embed, Patch } from "@http-client";
  import type { PatchView } from "./router";
  import type { Route } from "@app/lib/router";
  import type { ComponentProps } from "svelte";
  import type { Session } from "@app/lib/httpd";

  import * as modal from "@app/lib/modal";
  import * as role from "@app/lib/roles";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { experimental } from "@app/lib/appearance";
  import capitalize from "lodash/capitalize";
  import isEqual from "lodash/isEqual";
  import partial from "lodash/partial";
  import uniqBy from "lodash/uniqBy";
  import { HttpdClient } from "@http-client";
  import { httpdStore } from "@app/lib/httpd";
  import { parseEmbedIntoMap } from "@app/lib/file";

  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import Changeset from "@app/views/projects/Changeset.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import CommentToggleInput from "@app/components/CommentToggleInput.svelte";
  import CompareButton from "@app/views/projects/Patch/CompareButton.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import DiffStatBadge from "@app/components/DiffStatBadge.svelte";
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
  import Radio from "@app/components/Radio.svelte";
  import ReactionSelector from "@app/components/ReactionSelector.svelte";
  import Reactions from "@app/components/Reactions.svelte";
  import Reviews from "@app/views/projects/Cob/Reviews.svelte";
  import RevisionComponent from "@app/views/projects/Cob/Revision.svelte";
  import RevisionSelector from "@app/views/projects/Patch/RevisionSelector.svelte";
  import Share from "@app/views/projects/Share.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import { closeFocused } from "@app/components/Popover.svelte";

  export let baseUrl: BaseUrl;
  export let node: Node;
  export let patch: Patch;
  export let stats: Diff["stats"];
  export let rawPath: (commit?: string) => string;
  export let project: Project;
  export let view: PatchView;

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
    authors: Comment["reactions"][0]["authors"],
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
    authors: Revision["reactions"][0]["authors"],
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

  async function saveLabels(labels: string[]) {
    try {
      if (session) {
        labelState = "submit";
        await api.project.updatePatch(
          project.id,
          patch.id,
          { type: "label", labels },
          session.id,
        );
      }
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
      labelState = "read";
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
  $: reviews = computeReviews(patch);
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
  $: delegates = project.delegates.map(d => d.id);
  $: firstRevision = timelineTuple[0][0];
  $: latestRevision = patch.revisions[patch.revisions.length - 1];
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
    min-width: 0;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-large);
    word-break: break-word;
  }
  .bottom {
    background-color: var(--color-background-default);
    padding: 1rem 1rem 0.5rem 1rem;
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
  .author-metadata {
    color: var(--color-fill-gray);
    font-size: var(--font-size-small);
  }
  .revision-description {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  .connector {
    width: 1px;
    height: 1.5rem;
    margin-left: 1.25rem;
    background-color: var(--color-fill-separator);
  }
  @media (max-width: 719.98px) {
    .patch {
      display: block;
    }
    .bottom {
      padding: 1rem 0 0 0;
    }
  }
</style>

<Layout {node} {baseUrl} {project} activeTab="patches" stylePaddingBottom="0">
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
          {#if $experimental && session && role.isDelegateOrAuthor(session.publicKey, delegates, patch.author.id) && patchState === "read"}
            <div class="global-hide-on-mobile-down">
              <Button
                variant="outline"
                title="edit patch"
                on:click={() => (patchState = "edit")}>
                <IconSmall name={"edit"} />
                Edit
              </Button>
            </div>
          {/if}
          {#if patchState === "read"}
            <Share {baseUrl} />
            {#if $experimental && session && role.isDelegateOrAuthor(session.publicKey, delegates, patch.author.id)}
              <div class="global-hide-on-small-desktop-down">
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
        </svelte:fragment>
        <svelte:fragment slot="state">
          <Badge size="tiny" variant={badgeColor(patch.state.status)}>
            <IconSmall name="patch" />
            {capitalize(patch.state.status)}
          </Badge>
          <Link
            route={{
              resource: "project.patch",
              project: project.id,
              node: baseUrl,
              patch: patch.id,
              view: { name: "changes", revision: latestRevision.id },
            }}>
            <DiffStatBadge
              hoverable
              insertions={stats.insertions}
              deletions={stats.deletions} />
          </Link>
          <NodeId
            stylePopoverPositionLeft="-13px"
            nodeId={patch.author.id}
            alias={patch.author.alias} />
          opened
          <CopyableId id={patch.id} style="oid">
            {utils.formatObjectId(patch.id)}
          </CopyableId>
          <span title={utils.absoluteTimestamp(patch.revisions[0].timestamp)}>
            {utils.formatTimestamp(patch.revisions[0].timestamp)}
          </span>
          {#if patch.revisions[0].edits.length > 1 && lastEdit}
            <div
              class="author-metadata"
              title={utils.formatEditedCaption(
                lastEdit.author,
                lastEdit.timestamp,
              )}>
              • edited
            </div>
          {/if}
        </svelte:fragment>
        <div slot="subtitle" class="global-hide-on-desktop-up">
          <div
            style:margin-top="2rem"
            style="display: flex; flex-direction: column; gap: 0.5rem;">
            <Reviews {reviews} />
            <LabelInput
              locallyAuthenticated={role.isDelegate(
                session?.publicKey,
                delegates,
              )}
              submitInProgress={labelState === "submit"}
              labels={patch.labels}
              on:save={({ detail: newLabels }) => {
                void saveLabels(newLabels);
              }} />
            <Embeds embeds={uniqueEmbeds} />
          </div>
        </div>
        <svelte:fragment slot="description">
          <div class="revision-description">
            {#if $experimental && session && patchState !== "read" && lastEdit}
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
              <Markdown
                breaks
                content={description}
                rawPath={rawPath(patch.id)} />
            {:else}
              <span class="txt-missing">No description available</span>
            {/if}
            {#if ($experimental && session) || (firstRevision.revisionReactions && firstRevision.revisionReactions.length > 0)}
              <div class="actions">
                {#if session}
                  <div class="global-hide-on-mobile-down">
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
                  </div>
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
      </CobHeader>

      <div class="tabs">
        <div class="tabs-spacer" />
        <Radio styleGap="0.375rem">
          {#each Object.entries(tabs) as [name, { route, icon }]}
            <Link {route}>
              <Button
                size="large"
                variant={name === view.name ||
                (view.name === "diff" && name === "changes")
                  ? "tab-active"
                  : "tab"}>
                <IconSmall name={icon} />
                {capitalize(name)}
              </Button>
            </Link>
          {/each}
        </Radio>

        {#if view.name === "changes"}
          <div
            class="global-hide-on-mobile-down"
            style="margin-left: auto; margin-top: -0.5rem;">
            <RevisionSelector {view} {baseUrl} {patch} {project} />
          </div>
        {/if}
        {#if view.name === "diff"}
          <div
            class="global-hide-on-mobile-down"
            style="margin-left: auto; margin-top: -0.5rem;">
            <div style:margin-left="auto">
              <CompareButton
                fromCommit={view.fromCommit}
                toCommit={view.toCommit} />
            </div>
          </div>
        {/if}
        <div class="tabs-spacer" />
      </div>
      <div class="bottom">
        {#if view.name === "changes"}
          <div
            style:width="100%"
            style:padding="0 1rem"
            style:display="flex"
            class="global-hide-on-small-desktop-up">
            <RevisionSelector {view} {baseUrl} {patch} {project} />
          </div>
        {/if}
        {#if view.name === "diff"}
          <div
            style:width="100%"
            style:padding="0 1rem"
            style:display="flex"
            class="global-hide-on-small-desktop-up">
            <CompareButton
              fromCommit={view.fromCommit}
              toCommit={view.toCommit} />
          </div>
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
              {...revision}
              first={index === 0}
              canEdit={partial(
                role.isDelegateOrAuthor,
                session?.publicKey,
                delegates,
              )}
              editRevision={$experimental &&
                session &&
                partial(editRevision, session.id, revision.revisionId)}
              editComment={$experimental &&
                session &&
                partial(editComment, session.id, revision.revisionId)}
              reactOnComment={$experimental &&
                session &&
                partial(reactOnComment, session, revision.revisionId)}
              reactOnRevision={$experimental &&
                session &&
                partial(reactOnRevision, session, revision.revisionId)}
              createReply={$experimental &&
                session &&
                partial(createReply, session.id, revision.revisionId)}
              patchId={patch.id}
              patchState={patch.state}
              initiallyExpanded={index === patch.revisions.length - 1}
              previousRevId={previousRevision?.id}
              previousRevBase={previousRevision?.base}
              previousRevOid={previousRevision?.oid}>
              {#if index === patch.revisions.length - 1}
                {#if $experimental && session && view.name === "activity"}
                  <div class="global-hide-on-mobile-down">
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
                    {#if role.isDelegateOrAuthor(session.publicKey, delegates, patch.author.id)}
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

    <div class="metadata global-hide-on-medium-desktop-down">
      <Reviews {reviews} />
      <LabelInput
        locallyAuthenticated={role.isDelegate(session?.publicKey, delegates)}
        submitInProgress={labelState === "submit"}
        labels={patch.labels}
        on:save={({ detail: newLabels }) => {
          void saveLabels(newLabels);
        }} />
      <Embeds embeds={uniqueEmbeds} />
    </div>
  </div>
</Layout>
