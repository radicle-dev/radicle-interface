<script lang="ts" context="module">
  import type * as cobs from "@app/lib/cobs";
  import type { Merge, Review } from "@app/lib/patch";

  export interface TimelineReview {
    inner: [string, Review];
    type: "review";
    timestamp: number;
  }

  export interface TimelineMerge {
    inner: Merge;
    type: "merge";
    timestamp: number;
  }

  export interface TimelineThread {
    inner: cobs.Thread;
    type: "thread";
    timestamp: number;
  }
</script>

<script lang="ts">
  import type { Project } from "@app/lib/project";

  import * as router from "@app/lib/router";
  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Changeset from "./SourceBrowser/Changeset.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobSideInput from "./Cob/CobSideInput.svelte";
  import Comment from "@app/components/Comment.svelte";
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import Floating from "@app/components/Floating.svelte";
  import HeaderToggleLabel from "./HeaderToggleLabel.svelte";
  import TabBar from "@app/components/TabBar.svelte";
  import Thread from "@app/components/Thread.svelte";
  import capitalize from "lodash/capitalize";
  import { Patch } from "@app/lib/patch";
  import { createAddRemoveArrays } from "@app/lib/issue";
  import { formatCommit, isLocal } from "@app/lib/utils";
  import { formatObjectId, validateTag } from "@app/lib/cobs";
  import { sessionStore } from "@app/lib/session";

  export let patch: Patch;
  export let revision: string | undefined = undefined;
  export let currentTab: "activity" | "commits";
  export let project: Project;

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
      await patch.replyComment(
        project.id,
        currentRevision.id,
        reply.body,
        reply.id,
        project.seed.addr,
        $sessionStore.id,
      );
      patch = await Patch.getPatch(project.id, patch.id, project.seed.addr);
    }
  }

  async function saveTags({ detail: tags }: CustomEvent<string[]>) {
    if ($sessionStore) {
      const { add, remove } = createAddRemoveArrays(patch.tags, tags);
      if (add.length === 0 && remove.length === 0) {
        return;
      }
      await patch.editTags(
        project.id,
        add,
        remove,
        project.seed.addr,
        $sessionStore.id,
      );
      patch = await Patch.getPatch(project.id, patch.id, project.seed.addr);
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
    $sessionStore && isLocal(project.seed.addr.host) ? "edit" : "view";

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
  $: diffPromise = patch.getPatchDiff(
    project.id,
    currentRevision,
    project.seed.addr,
  );
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
  .highlight {
    color: var(--color-foreground-6);
  }
  .tag {
    overflow: hidden;
    text-overflow: ellipsis;
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
      <span slot="revision" class="revision txt-monospace txt-tiny">
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
                  key: `Revision ${i} (${formatObjectId(r.id)})`,
                  title: `Revision ${i} (${formatObjectId(r.id)})`,
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
              }} />
          </svelte:fragment>
        </Floating>
      </span>
      <svelte:fragment slot="state">
        {#if patch.state.status === "draft"}
          <Badge variant="foreground">
            {patch.state.status}
          </Badge>
        {:else if patch.state.status === "open"}
          <Badge variant="positive">
            {patch.state.status}
          </Badge>
        {:else}
          <Badge variant="positive">
            {patch.state.status}
          </Badge>
        {/if}
        <div class="layout-desktop">
          <Authorship
            highlight
            timestamp={patch.revisions[0].timestamp}
            author={patch.author}
            caption="opened this patch" />
        </div>
        <div class="layout-mobile">
          <Authorship highlight author={patch.author} />
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
          <Comment
            caption="created this revision"
            author={patch.author}
            timestamp={currentRevision.timestamp}
            rawPath={project.getRawPath()}
            body={currentRevisionIndex === 0
              ? patch.description
              : currentRevision.description} />
        </div>
        {#each timeline as element}
          {#if element.type === "thread"}
            <!-- TODO: Implement reply creation and comment editing -->
            <Thread
              rawPath={project.getRawPath()}
              isDescription={false}
              thread={element.inner}
              on:reply={createReply}
              on:select={({ detail: index }) => (currentRevision = index)} />
          {:else if element.type === "merge"}
            <div class="action layout-desktop txt-tiny">
              <Authorship
                author={{ id: element.inner.node }}
                timestamp={element.timestamp}>
                merged
                <span class="highlight">
                  {formatCommit(element.inner.commit)}
                </span>
              </Authorship>
            </div>
            <div class="action layout-mobile txt-tiny">
              <Authorship author={{ id: element.inner.node }}>
                merged
                <span class="highlight">
                  {formatCommit(element.inner.commit)}
                </span>
              </Authorship>
            </div>
          {:else if element.type === "review"}
            <!-- TODO: Implement inline code comments -->
            {@const [author, review] = element.inner}
            <div class="action layout-desktop txt-tiny">
              <Authorship author={{ id: author }} timestamp={element.timestamp}>
                {formatVerdict(review.verdict)}
              </Authorship>
            </div>
            <div class="action layout-mobile txt-tiny">
              <Authorship author={{ id: author }}>
                {formatVerdict(review.verdict)}
              </Authorship>
            </div>
            {#if review.comment}
              <Comment
                caption="left a comment"
                author={{ id: author }}
                timestamp={review.timestamp}
                rawPath={project.getRawPath()}
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
              commit={{ commit: commit }}
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
            stats={diff.diff.stats}
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
    <CobSideInput
      {action}
      title="Tags"
      placeholder="Add tag"
      items={patch.tags}
      on:save={saveTags}
      validate={item => item.trim().length > 0}
      validateAdd={(item, items) => validateTag(item, items)}>
      <svelte:fragment let:item>
        <div class="tag">{item}</div>
      </svelte:fragment>
    </CobSideInput>
  </div>
</div>
