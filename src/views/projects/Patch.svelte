<script lang="ts" context="module">
  import type { Comment, Review, Merge } from "@httpd-client";

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
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Floating, { closeFocused } from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import RevisionComponent from "@app/views/projects/Cob/Revision.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";
  import TagInput from "@app/views/projects/Cob/TagInput.svelte";

  export let search: string | undefined = undefined;
  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let patch: Patch;
  export let projectHead: string;
  export let projectDefaultBranch: string;
  export let revision: string | undefined = undefined;

  $: searchParams = new URLSearchParams(search || "");
  $: currentTab =
    (searchParams.get("tab") as "activity" | "commits" | "files") || "activity";
  $: diff = searchParams.get("diff") || undefined;

  const api = new HttpdClient(baseUrl);

  async function createReply({
    detail: reply,
  }: CustomEvent<{ id: string; body: string }>) {
    if ($httpdStore.state === "authenticated" && reply.body.trim().length > 0) {
      await api.project.updatePatch(
        projectId,
        patch.id,
        {
          type: "thread",
          revision: currentRevision.id,
          action: {
            type: "comment",
            body: reply.body,
            replyTo: reply.id,
          },
        },
        $httpdStore.session.id,
      );
      patch = await api.project.getPatchById(projectId, patch.id);
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
      await api.project.updatePatch(
        projectId,
        currentRevision.id,
        { type: "tag", add, remove },
        $httpdStore.session.id,
      );
      patch = await api.project.getPatchById(projectId, patch.id);
    }
  }

  const action: "create" | "edit" | "view" =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? "edit"
      : "view";
  const options = ["activity", "commits", "files"].map(o => ({
    value: o,
    title: capitalize(o),
    disabled: false,
  }));

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

  $: patchReviews = computeReviews(patch);
  $: currentRevision =
    (revision && patch.revisions.find(r => r.id === revision)) ||
    patch.revisions[patch.revisions.length - 1];
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
              projectId,
              baseUrl,
              currentRevision.oid,
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
        {#each options as option}
          {#if !option.disabled}
            <Link
              route={{
                resource: "projects",
                params: {
                  id: projectId,
                  baseUrl,
                  view: {
                    resource: "patch",
                    params: {
                      patch: patch.id,
                      revision,
                      search: `tab=${option.value}`,
                    },
                  },
                },
              }}>
              <SquareButton
                size="small"
                clickable={option.disabled}
                active={option.value === currentTab && !diff}
                disabled={option.disabled}>
                {option.title}
              </SquareButton>
            </Link>
          {:else}
            <SquareButton
              size="small"
              clickable={option.disabled}
              active={option.value === currentTab}
              disabled={option.disabled}>
              {option.title}
            </SquareButton>
          {/if}
        {/each}
        {#if diff}
          <Link
            route={{
              resource: "projects",
              params: {
                id: projectId,
                baseUrl,
                view: {
                  resource: "patch",
                  params: {
                    patch: patch.id,
                    search: `diff=${diff}`,
                  },
                },
              },
            }}>
            <SquareButton size="small" active={true}>
              Diff {diff.substr(0, 6)}..{diff.split("..")[1].substr(0, 6)}
            </SquareButton>
          </Link>
        {/if}
      </div>

      {#if currentTab !== "activity"}
        <Floating disabled={patch.revisions.length === 1}>
          <svelte:fragment slot="toggle">
            <SquareButton
              size="small"
              clickable={patch.revisions.length > 1}
              disabled={patch.revisions.length === 1}>
              Revision {utils.formatObjectId(currentRevision.id)}
            </SquareButton>
          </svelte:fragment>
          <svelte:fragment slot="modal">
            <Dropdown items={patch.revisions}>
              <svelte:fragment slot="item" let:item>
                <Link
                  on:afterNavigate={closeFocused}
                  route={{
                    resource: "projects",
                    params: {
                      id: projectId,

                      baseUrl,
                      view: {
                        resource: "patch",
                        params: {
                          patch: patch.id,
                          revision: item.id,
                          search: `tab=${currentTab}`,
                        },
                      },
                    },
                  }}>
                  <DropdownItem
                    selected={item.id === currentRevision.id}
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
    {#if currentTab === "activity"}
      {#if diff}
        {#await api.project.getDiff(projectId, diff.split("..")[0], diff.split("..")[1]) then diff}
          <div style:margin-top="1rem">
            <Changeset
              {projectId}
              {baseUrl}
              revision={currentRevision.oid}
              diff={diff.diff} />
          </div>
        {:catch e}
          <ErrorMessage
            message="Not able to load revision diff."
            stackTrace={e} />
        {/await}
      {:else}
        {#each timelineTuple as [revision, timelines], index}
          {@const previousRevision =
            index > 0 ? patch.revisions[index - 1] : undefined}
          <RevisionComponent
            {baseUrl}
            {projectId}
            {timelines}
            {projectDefaultBranch}
            {projectHead}
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
      {/if}
    {:else if currentTab === "commits"}
      {#await api.project.getDiff(projectId, currentRevision.base, currentRevision.oid) then diff}
        <div class="commit-list">
          {#each diff.commits as commit}
            <CommitTeaser {projectId} {baseUrl} {commit} />
          {/each}
        </div>
      {:catch e}
        <ErrorMessage message="Not able to load commits." stackTrace={e} />
      {/await}
    {:else if currentTab === "files"}
      {#await api.project.getDiff(projectId, currentRevision.base, currentRevision.oid) then diff}
        <div style:margin-top="1rem">
          <Changeset
            {projectId}
            {baseUrl}
            revision={currentRevision.oid}
            diff={diff.diff} />
        </div>
      {:catch e}
        <ErrorMessage message="Not able to load files diff." stackTrace={e} />
      {/await}
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
