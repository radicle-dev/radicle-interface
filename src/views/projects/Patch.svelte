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
  import type { BaseUrl, Patch, PatchUpdateAction } from "@httpd-client";
  import type { PatchView } from "./router";
  import type { Route } from "@app/lib/router";
  import type { Session } from "@app/lib/httpd";
  import type { Variant } from "@app/components/Badge.svelte";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { capitalize, isEqual } from "lodash";
  import { httpdStore } from "@app/lib/httpd";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Changeset from "@app/views/projects/Changeset.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobStateButton from "@app/views/projects/Cob/CobStateButton.svelte";
  import CommitTeaser from "@app/views/projects/Commit/CommitTeaser.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorModal from "@app/views/projects/Cob/ErrorModal.svelte";
  import Floating, { closeFocused } from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import RevisionComponent from "@app/views/projects/Cob/Revision.svelte";
  import Button from "@app/components/Button.svelte";
  import Textarea from "@app/components/Textarea.svelte";

  export let baseUrl: BaseUrl;
  export let patch: Patch;
  export let project: Project;
  export let view: PatchView;

  $: api = new HttpdClient(baseUrl);

  const items: [string, LifecycleState][] = [
    ["Reopen patch", { status: "open" }],
    ["Archive patch", { status: "archived" }],
    ["Convert to draft", { status: "draft" }],
  ];

  async function createReply({
    detail: reply,
  }: CustomEvent<{ id: string; body: string }>) {
    if ($httpdStore.state === "authenticated" && reply.body.trim().length > 0) {
      const status = await updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.comment",
          revision: revisionId,
          body: reply.body,
          replyTo: reply.id,
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        patch = await api.project.getPatchById(project.id, patch.id);
      }
    }
  }
  async function handleReaction(
    revisionId: string,
    {
      detail: { nids, id, reaction },
    }: CustomEvent<{
      nids: string[];
      id: string;
      reaction: string;
    }>,
  ) {
    if ($httpdStore.state === "authenticated") {
      const status = await updatePatch(
        project.id,
        patch.id,
        {
          type: "revision.comment.react",
          revision: revisionId,
          comment: id,
          reaction,
          active: nids.includes($httpdStore.session.publicKey) ? false : true,
        },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        patch = await api.project.getPatchById(project.id, patch.id);
      }
    }
  }
  async function createComment() {
    if (
      $httpdStore.state === "authenticated" &&
      commentBody.trim().length > 0
    ) {
      const status = await updatePatch(
        project.id,
        patch.id,
        { type: "revision.comment", body: commentBody, revision: revisionId },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        patch = await api.project.getPatchById(project.id, patch.id);
      }
    }
  }
  async function saveStatus({ detail: state }: CustomEvent<PatchState>) {
    if ($httpdStore.state === "authenticated" && state.status !== "merged") {
      const status = await updatePatch(
        project.id,
        patch.id,
        { type: "lifecycle", state },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        void router.push({
          resource: "project.patch",
          project: project.id,
          node: baseUrl,
          patch: patch.id,
        });
      }
    }
  }
  function badgeColor(status: string): Variant {
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

  async function saveLabels({ detail: labels }: CustomEvent<string[]>) {
    if ($httpdStore.state === "authenticated") {
      if (isEqual(patch.labels, labels)) {
        return;
      }

      let revision;
      if (view.name === "diff") {
        revision = patch.revisions[patch.revisions.length - 1].id;
      } else {
        revision = view.revision;
      }
      const status = await updatePatch(
        project.id,
        revision,
        { type: "label", labels: labels },
        $httpdStore.session,
        api,
      );
      if (status === "success") {
        patch = await api.project.getPatchById(project.id, patch.id);
      }
    }
  }

  export async function updatePatch(
    projectId: string,
    patchId: string,
    action: PatchUpdateAction,
    session: Session,
    api: HttpdClient,
  ): Promise<"success" | "error"> {
    try {
      await api.project.updatePatch(projectId, patchId, action, session.id);
      return "success";
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Patch editing failed",
            subtitle: [
              "There was an error while updating the patch.",
              "Check your radicle-httpd logs for details.",
            ],
            error,
          },
        });
      }
      return "error";
    }
  }

  $: action = (
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? "edit"
      : "view"
  ) as "edit" | "view";

  let tabs: Record<string, Route>;
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
        ...baseRoute,
        view: { name: "activity" },
      },
      commits: {
        ...baseRoute,
        view: { name: "commits", revision },
      },
      files: {
        ...baseRoute,
        view: { name: "files", revision },
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

  let commentBody = "";
  let revisionId: string;
  $: if (view.name === "diff") {
    revisionId = patch.revisions[patch.revisions.length - 1].id;
  } else {
    revisionId = view.revision;
  }

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

  let expanded: boolean = false;
</script>

<style>
  .patch {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
  }
  .metadata {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
  .tab-line {
    display: flex;
    margin: 3rem 0 1.5rem 0;
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
  .draft {
    color: var(--color-fill-gray);
  }
  .open {
    color: var(--color-fill-success);
  }
  .archived {
    color: var(--color-fill-yellow);
  }
  .merged {
    color: var(--color-fill-primary);
  }
  .metadata-section-header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
    color: var(--color-foreground-6);
  }
  .metadata-section-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .review {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .review-accept {
    color: var(--color-positive);
  }
  .review-reject {
    color: var(--color-negative);
  }
  .diff-button-range {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-bold);
  }
  .teaser-wrapper:not(:last-child) {
    border-bottom: 1px solid var(--color-border-hint);
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

<Layout {baseUrl} {project} activeTab="patches">
  <div class="patch">
    <div>
      <CobHeader id={patch.id} title={patch.title}>
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
          {#if patch.revisions[0].description}
            <Markdown
              content={patch.revisions[0].description}
              rawPath={utils.getRawBasePath(
                project.id,
                baseUrl,
                patch.revisions[0].id,
              )} />
          {:else}
            <span class="txt-missing">No description available</span>
          {/if}
        </svelte:fragment>
        <div class="author" slot="author">
          opened by <Authorship
            authorId={patch.author.id}
            authorAlias={patch.author.alias} />
          {utils.formatTimestamp(patch.revisions[0].timestamp)}
        </div>
      </CobHeader>

      <div class="tab-line">
        <div style="display: flex; gap: 0.5rem;">
          {#each Object.entries(tabs) as [name, route]}
            <Link {route}>
              <Button
                size="regular"
                variant={name === view.name ? "secondary" : "gray"}>
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
              <Button size="regular" variant="secondary">
                Diff <span class="diff-button-range">
                  {view.fromCommit.substring(0, 6)}..{view.toCommit.substring(
                    0,
                    6,
                  )}
                </span>
              </Button>
            </Link>
          {/if}
        </div>

        {#if view.name === "commits" || view.name === "files"}
          <div style="margin-left: auto;">
            <Floating disabled={patch.revisions.length === 1} bind:expanded>
              <Button
                slot="toggle"
                size="regular"
                clickable={patch.revisions.length > 1}
                disabled={patch.revisions.length === 1}>
                Revision {utils.formatObjectId(view.revision)}
                <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
              </Button>
              <DropdownList slot="modal" items={patch.revisions}>
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
                      Revision {utils.formatObjectId(item.id)}
                    </DropdownListItem>
                  </Link>
                </svelte:fragment>
              </DropdownList>
            </Floating>
          </div>
        {/if}
      </div>
      {#if view.name === "diff"}
        <div style:margin-top="1rem">
          <Changeset
            projectId={project.id}
            {baseUrl}
            revision={view.toCommit}
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
            on:react={event => handleReaction(revisionId, event)}
            on:reply={createReply}
            patchId={patch.id}
            expanded={index === patch.revisions.length - 1}
            previousRevId={previousRevision?.id}
            previousRevOid={previousRevision?.oid} />
        {:else}
          <Placeholder emoji="🍂">
            <div slot="title">No activity</div>
            <div slot="body">No activity on this patch yet</div>
          </Placeholder>
        {/each}
      {:else if view.name === "commits"}
        <div class="commit-list">
          {#each view.commits as commit}
            <div class="teaser-wrapper">
              <CommitTeaser projectId={project.id} {baseUrl} {commit} />
            </div>
          {/each}
        </div>
      {:else if view.name === "files"}
        <div style:margin-top="1rem">
          <Changeset
            projectId={project.id}
            {baseUrl}
            revision={view.revision}
            diff={view.diff} />
        </div>
      {:else}
        {utils.unreachable(view.name)}
      {/if}
      {#if $httpdStore.state === "authenticated" && view.name === "activity"}
        <div style:margin-top="1rem">
          <Textarea
            resizable
            on:submit={async () => {
              await createComment();
              commentBody = "";
            }}
            bind:value={commentBody}
            placeholder="Leave your comment" />
          <div class="actions txt-small">
            <CobStateButton
              items={items.filter(([, state]) => !isEqual(state, patch.state))}
              {selectedItem}
              state={patch.state}
              on:saveStatus={saveStatus} />
            <Button
              variant="secondary"
              disabled={!commentBody}
              on:click={async () => {
                await createComment();
                commentBody = "";
              }}>
              Comment
            </Button>
          </div>
        </div>
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
              <Authorship
                authorId={review.author.id}
                authorAlias={review.author.alias} />
            </div>
          {:else}
            <div class="txt-missing">No reviews</div>
          {/each}
        </div>
      </div>
      <LabelInput {action} labels={patch.labels} on:save={saveLabels} />
    </div>
  </div>
</Layout>
