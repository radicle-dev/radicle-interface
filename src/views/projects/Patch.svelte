<script lang="ts" context="module">
  import type { Comment, Review, Merge, Project } from "@httpd-client";

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
  import type { Variant } from "@app/components/Badge.svelte";
  import { type Route } from "@app/lib/router";
  import type { PatchView } from "./router";

  import * as utils from "@app/lib/utils";
  import { capitalize } from "lodash";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Changeset from "@app/views/projects/SourceBrowser/Changeset.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CommitTeaser from "@app/views/projects/Commit/CommitTeaser.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownItem from "@app/components/Dropdown/DropdownItem.svelte";
  import Floating, { closeFocused } from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import RevisionComponent from "@app/views/projects/Cob/Revision.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";
  import TagInput from "@app/views/projects/Cob/TagInput.svelte";

  export let baseUrl: BaseUrl;
  export let project: Project;
  export let view: PatchView;

  $: api = new HttpdClient(baseUrl);
  $: patch = view.patch;

  async function createReply({
    detail: reply,
  }: CustomEvent<{ id: string; body: string }>) {
    if ($httpdStore.state === "authenticated" && reply.body.trim().length > 0) {
      await api.project.updatePatch(
        project.id,
        patch.id,
        {
          type: "thread",
          revision: revisionId,
          action: {
            type: "comment",
            body: reply.body,
            replyTo: reply.id,
          },
        },
        $httpdStore.session.id,
      );
      patch = await api.project.getPatchById(project.id, patch.id);
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

  async function saveTags({ detail: tags }: CustomEvent<string[]>) {
    if ($httpdStore.state === "authenticated") {
      const { add, remove } = utils.createAddRemoveArrays(patch.tags, tags);
      if (add.length === 0 && remove.length === 0) {
        return;
      }

      let revision;
      if (view.view.name === "diff") {
        revision = patch.revisions[patch.revisions.length - 1].id;
      } else {
        revision = view.view.revision;
      }
      await api.project.updatePatch(
        project.id,
        revision,
        { type: "tag", add, remove },
        $httpdStore.session.id,
      );
      patch = await api.project.getPatchById(project.id, patch.id);
    }
  }

  const action: "create" | "edit" | "view" =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? "edit"
      : "view";

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

  let revisionId: string;
  $: if (view.view.name === "diff") {
    revisionId = patch.revisions[patch.revisions.length - 1].id;
  } else {
    revisionId = view.view.revision;
  }

  $: patchReviews = computeReviews(patch);
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
</script>

<style>
  .patch {
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
  .commit-list {
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-top: 1rem;
  }
  .tab-line {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
  }
  .author {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
  }
  .draft {
    color: var(--color-foreground-6);
  }
  .open {
    color: var(--color-positive-6);
  }
  .archived {
    color: var(--color-caution-6);
  }
  .merged {
    color: var(--color-primary-6);
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

  @media (max-width: 1092px) {
    .patch {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }
    .metadata {
      display: none;
    }
  }
  @media (max-width: 960px) {
    .patch {
      padding-left: 2rem;
    }
  }
</style>

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
        <Badge variant={badgeColor(patch.state.status)}>
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
            <SquareButton size="small" active={name === view.view.name}>
              {capitalize(name)}
            </SquareButton>
          </Link>
        {/each}
        {#if view.view.name === "diff"}
          <Link
            route={{
              resource: "project.patch",
              project: project.id,
              node: baseUrl,
              patch: patch.id,
              view: {
                name: "diff",
                fromCommit: view.view.fromCommit,
                toCommit: view.view.toCommit,
              },
            }}>
            <SquareButton size="small" active={true}>
              Diff {view.view.fromCommit.substring(
                0,
                6,
              )}..{view.view.toCommit.substring(0, 6)}
            </SquareButton>
          </Link>
        {/if}
      </div>

      {#if view.view.name === "commits" || view.view.name === "files"}
        <Floating disabled={patch.revisions.length === 1}>
          <svelte:fragment slot="toggle">
            <SquareButton
              size="small"
              clickable={patch.revisions.length > 1}
              disabled={patch.revisions.length === 1}>
              Revision {utils.formatObjectId(view.view.revision)}
            </SquareButton>
          </svelte:fragment>
          <svelte:fragment slot="modal">
            <Dropdown items={patch.revisions}>
              <svelte:fragment slot="item" let:item>
                <Link
                  on:afterNavigate={closeFocused}
                  route={{
                    resource: "project.patch",
                    project: project.id,
                    node: baseUrl,
                    patch: patch.id,
                    view: {
                      name: view.view.name,
                      revision: item.id,
                    },
                  }}>
                  <DropdownItem
                    selected={item.id === view.view.revision}
                    size="tiny">
                    Revision {utils.formatObjectId(item.id)}
                  </DropdownItem>
                </Link>
              </svelte:fragment>
            </Dropdown>
          </svelte:fragment>
        </Floating>
      {/if}
    </div>
    {#if view.view.name === "diff"}
      <div style:margin-top="1rem">
        <Changeset
          projectId={project.id}
          {baseUrl}
          revision={view.view.toCommit}
          diff={view.view.diff} />
      </div>
    {:else if view.view.name === "activity"}
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
    {:else if view.view.name === "commits"}
      <div class="commit-list">
        {#each view.view.commits as commit}
          <CommitTeaser projectId={project.id} {baseUrl} {commit} />
        {/each}
      </div>
    {:else if view.view.name === "files"}
      <div style:margin-top="1rem">
        <Changeset
          projectId={project.id}
          {baseUrl}
          revision={view.view.revision}
          diff={view.view.diff} />
      </div>
    {:else}
      {utils.unreachable(view.view.name)}
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
                <Icon size="small" name="checkmark" />
              {:else if review.verdict === "reject"}
                <Icon size="small" name="cross" />
              {:else}
                <Icon size="small" name="chat" />
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
    <TagInput {action} tags={patch.tags} on:save={saveTags} />
  </div>
</div>
