<script lang="ts">
  import type { BaseUrl, Comment, Merge, Patch, Review } from "@httpd-client";
  import type { Variant } from "@app/components/Badge.svelte";

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

  import capitalize from "lodash/capitalize";

  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { sessionStore } from "@app/lib/session";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Changeset from "./SourceBrowser/Changeset.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CommentComponent from "@app/components/Comment.svelte";
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import Floating from "@app/components/Floating.svelte";
  import HeaderToggleLabel from "./HeaderToggleLabel.svelte";
  import TabBar from "@app/components/TabBar.svelte";
  import TagInput from "./Cob/TagInput.svelte";
  import ThreadComponent from "@app/components/Thread.svelte";

  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let patch: Patch;
  export let projectHead: string;
  export let revision: string | undefined = undefined;
  export let currentTab: "activity" | "commits";

  const api = new HttpdClient(baseUrl);

  const browseCommit = (event: { detail: string }) => {
    router.updateProjectRoute({
      view: { resource: "tree" },
      search: undefined,
      revision: event.detail,
    });
  };

  async function createReply({
    detail: reply,
  }: CustomEvent<{ id: string; body: string }>) {
    if ($sessionStore && reply.body.trim().length > 0) {
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
        $sessionStore.id,
      );
      patch = await api.project.getPatchById(projectId, patch.id);
    }
  }

  async function saveTags({ detail: tags }: CustomEvent<string[]>) {
    if ($sessionStore) {
      const { add, remove } = utils.createAddRemoveArrays(patch.tags, tags);
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      await api.project.updatePatch(
        projectId,
        currentRevision.id,
        { type: "tag", add, remove },
        $sessionStore.id,
      );
      patch = await api.project.getPatchById(projectId, patch.id);
    }
  }

  function formatVerdict(verdict?: string) {
    switch (verdict) {
      case "accept":
        return "accepted this revision";
      case "reject":
        return "rejected this revision";
      default:
        return "left a comment";
    }
  }

  const action: "create" | "edit" | "view" =
    $sessionStore && utils.isLocal(baseUrl.hostname) ? "edit" : "view";

  // Reactive due to eventual changes in patch.revisions
  $: enumeratedRevisions = patch.revisions.map((r, i) => [r, i] as const);
  $: currentRevisionTuple =
    enumeratedRevisions.find(([rev]) => rev.id === revision) ||
    enumeratedRevisions[enumeratedRevisions.length - 1];
  $: [currentRevision, currentRevisionIndex] = currentRevisionTuple;
  $: options = ["activity", "commits", "files"].map(o => ({
    value: o,
    title: capitalize(o),
    disabled: false,
  }));
  $: reviews = currentRevision.reviews.map<TimelineReview>(
    ([author, review]) => ({
      timestamp: review.timestamp,
      type: "review",
      inner: [author, review],
    }),
  );
  $: merges = currentRevision.merges.map<TimelineMerge>(inner => ({
    timestamp: inner.timestamp,
    type: "merge",
    inner,
  }));
  $: threads = currentRevision.discussions
    .filter(comment => !comment.replyTo)
    .map<TimelineThread>(
      thread => ({
        timestamp: thread.timestamp,
        type: "thread",
        inner: {
          root: thread,
          replies: currentRevision.discussions
            .filter(comment => comment.replyTo === thread.id)
            .sort((a, b) => a.timestamp - b.timestamp),
        },
      }),
      [],
    );
  $: timeline = [...reviews, ...merges, ...threads].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  $: diffPromise = api.project.getDiff(
    projectId,
    currentRevision.base,
    currentRevision.oid,
  );

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
</script>

<style>
  .patch {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
    padding: 0 2rem 0 8rem;
    margin-bottom: 4.5rem;
  }
  .metadata {
    border-radius: var(--border-radius);
    font-size: var(--font-size-small);
    padding-left: 1rem;
    margin-left: 1rem;
  }
  .action {
    margin: 1rem;
    color: var(--color-foreground-5);
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
      <span slot="revision" class="txt-monospace txt-tiny">
        <Floating>
          <svelte:fragment slot="toggle">
            <HeaderToggleLabel
              clickable={patch.revisions.length > 1}
              disabled={patch.revisions.length === 1}
              title="Toggle revision">
              Revision {currentRevisionIndex}
            </HeaderToggleLabel>
          </svelte:fragment>
          <svelte:fragment slot="modal">
            <Dropdown
              items={enumeratedRevisions.map(([r, i]) => {
                return {
                  title: `Revision ${i} (${utils.formatObjectId(r.id)})`,
                  value: r.id,
                  badge: null,
                };
              })}
              selected={currentRevision.toString()}
              on:select={({ detail: item }) => {
                router.updateProjectRoute({
                  view: {
                    resource: "patch",
                    params: { patch: patch.id, revision: item.value },
                  },
                });
              }}>
              <span slot="item" let:item>
                {item.title}
              </span>
            </Dropdown>
          </svelte:fragment>
        </Floating>
      </span>
      <svelte:fragment slot="state">
        <Badge variant={badgeColor(patch.state.status)}>
          {patch.state.status}
        </Badge>
        <div class="layout-desktop">
          <Authorship
            timestamp={patch.revisions[0].timestamp}
            authorId={patch.author.id}
            caption="opened this patch" />
        </div>
        <div class="layout-mobile">
          <Authorship authorId={patch.author.id} />
        </div>
      </svelte:fragment>
    </CobHeader>
    <TabBar
      {options}
      active={currentTab}
      on:select={({ detail: tab }) =>
        router.updateProjectRoute({
          search: `tab=${tab}`,
        })} />
    {#if currentTab === "activity"}
      <div style:margin-top="1rem">
        <div class="txt-tiny">
          <CommentComponent
            caption="created this revision"
            authorId={patch.author.id}
            timestamp={currentRevision.timestamp}
            rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
            body={currentRevisionIndex === 0
              ? patch.description
              : currentRevision.description} />
        </div>
        {#each timeline as element}
          {#if element.type === "thread"}
            <!-- TODO: Implement reply creation and comment editing -->
            <ThreadComponent
              rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
              isDescription={false}
              thread={element.inner}
              on:reply={createReply}
              on:select={({ detail: index }) => (currentRevision = index)} />
          {:else if element.type === "merge"}
            <div class="action layout-desktop txt-tiny">
              <Authorship
                authorId={element.inner.node}
                timestamp={element.timestamp}>
                merged
                {utils.formatCommit(element.inner.commit)}
              </Authorship>
            </div>
            <div class="action layout-mobile txt-tiny">
              <Authorship authorId={element.inner.node}>
                merged
                {utils.formatCommit(element.inner.commit)}
              </Authorship>
            </div>
          {:else if element.type === "review"}
            <!-- TODO: Implement inline code comments -->
            {@const [author, review] = element.inner}
            <div class="action layout-desktop txt-tiny">
              <Authorship authorId={author} timestamp={element.timestamp}>
                {formatVerdict(review.verdict)}
              </Authorship>
            </div>
            <div class="action layout-mobile txt-tiny">
              <Authorship authorId={author}>
                {formatVerdict(review.verdict)}
              </Authorship>
            </div>
            {#if review.comment}
              <CommentComponent
                caption="left a comment"
                authorId={author}
                timestamp={review.timestamp}
                rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
                body={review.comment} />
            {/if}
          {/if}
        {/each}
      </div>
    {:else if currentTab === "commits"}
      {#await diffPromise then diff}
        <div style:margin-top="1rem">
          {#each diff.commits as commit}
            <CommitTeaser
              {commit}
              on:click={() => {
                router.updateProjectRoute({
                  view: { resource: "commits" },
                  revision: commit.id,
                  search: undefined,
                });
              }}
              on:browseCommit={browseCommit} />
          {/each}
        </div>
      {/await}
    {:else if currentTab === "files"}
      {#await diffPromise then diff}
        <div style:margin-top="1rem">
          <Changeset
            diff={diff.diff}
            on:browse={({ detail: path }) => {
              router.updateProjectRoute({
                view: { resource: "tree" },
                search: undefined,
                revision: currentRevision.oid,
                path,
              });
            }} />
        </div>
      {/await}
    {/if}
  </div>
  <div class="metadata">
    <TagInput {action} tags={patch.tags} on:save={saveTags} />
  </div>
</div>
