<script lang="ts">
  import type {
    BaseUrl,
    DiffResponse,
    PatchState,
    Verdict,
  } from "@httpd-client";
  import type { Timeline } from "@app/views/projects/Patch.svelte";

  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { onMount } from "svelte";

  import CobCommitListing from "@app/views/projects/Cob/CobCommitListing.svelte";
  import CommentComponent from "@app/components/Comment.svelte";
  import DiffStatBadge from "@app/components/DiffStatBadge.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import ExpandButton from "@app/components/ExpandButton.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Popover from "@app/components/Popover.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import Thread from "@app/components/Thread.svelte";

  export let baseUrl: BaseUrl;
  export let expanded: boolean = false;
  export let patchId: string;
  export let patchState: PatchState;
  export let projectHead: string;
  export let projectDefaultBranch: string;
  export let projectId: string;
  export let revisionBase: string;
  export let revisionId: string;
  export let revisionOid: string;
  export let revisionTimestamp: number;
  export let revisionAuthor: { id: string; alias?: string | undefined };
  export let revisionDescription: string;
  export let timelines: Timeline[];
  export let previousRevId: string | undefined = undefined;
  export let previousRevOid: string | undefined = undefined;
  export let first: boolean;

  const api = new HttpdClient(baseUrl);

  function formatVerdict(verdict?: Verdict | null) {
    switch (verdict) {
      case "accept":
        return "accepted revision";
      case "reject":
        return "rejected revision";
      default:
        return "left a review";
    }
  }

  function verdictIconColor(verdict?: Verdict | null) {
    switch (verdict) {
      case "accept":
        return "var(--color-foreground-success)";
      case "reject":
        return "var(--color-foreground-red)";
      default:
        return "var(--color-foreground-gray)";
    }
  }

  function badgeColor({ status }: PatchState): string | undefined {
    if (status === "draft") {
      return "var(--color-foreground-gray)";
    } else if (status === "open") {
      return "var(--color-foreground-success)";
    } else if (status === "archived") {
      return "var(--color-foreground-yellow)";
    } else if (status === "merged") {
      return "var(--color-fill-primary)";
    } else {
      return "var(--color-foreground-success)";
    }
  }

  let response: DiffResponse | undefined = undefined;
  let error: any | undefined = undefined;
  let loading: boolean = false;

  onMount(async () => {
    try {
      loading = true;
      response = await api.project.getDiff(
        projectId,
        revisionBase,
        revisionOid,
      );
    } catch (err: any) {
      error = err;
    } finally {
      loading = false;
    }
  });
</script>

<style>
  .action {
    border-radius: var(--border-radius-small);
    min-height: 3rem;
    align-items: center;
  }
  .merge {
    border: 1px solid var(--color-border-merged);
    background-color: var(--color-fill-merged);
  }
  .positive-review {
    border: 1px solid var(--color-fill-diff-green);
    background-color: var(--color-fill-diff-green-light);
  }
  .comment-review {
    border: 1px solid var(--color-border-hint);
    background-color: var(--color-fill-float);
  }
  .negative-review {
    border: 1px solid var(--color-fill-diff-red);
    background-color: var(--color-fill-diff-red-light);
  }

  .diff-error {
    margin: 1rem 1.5rem;
  }
  .revision {
    display: flex;
    flex-direction: column;
    border-radius: var(--border-radius-small);
  }
  .revision-box {
    border-radius: var(--border-radius-small);
  }
  .revision-header {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    padding: 0.5rem;
    font-size: var(--font-size-small);
    height: 3rem;
  }
  .revision-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: var(--font-weight-medium);
  }
  .revision-data {
    gap: 0.75rem;
    display: flex;
    align-items: center;
    margin-left: auto;
    color: var(--color-foreground-dim);
  }
  .revision-description {
    margin-bottom: 1rem;
    margin-left: 2rem;
  }
  .compare-dropdown-item {
    font-weight: var(--font-weight-regular);
  }
  .patch-header {
    background-color: var(--color-fill-float);
    border-bottom: 1px solid var(--color-fill-separator);
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-small);
  }
  .authorship-header {
    display: flex;
    align-items: center;
    min-height: 3.5rem;
    gap: 0.5rem;
    padding: 0 0.5rem;
    font-size: var(--font-size-small);
  }
  .timestamp {
    margin-left: auto;
    font-size: var(--font-size-small);
    color: var(--color-fill-gray);
  }
  .expanded {
    box-shadow: 0 0 0 1px var(--color-border-hint);
  }
  .connector {
    width: 1px;
    height: 1.5rem;
    margin-left: 1rem;
    background-color: var(--color-fill-separator);
  }
</style>

<div class="revision" style:margin-bottom={expanded ? "2rem" : "0.5rem"}>
  <div class="revision-box" class:expanded>
    <div class="revision-header">
      <div class="revision-name">
        <ExpandButton
          {expanded}
          on:toggle={() => {
            expanded = !expanded;
          }} />
        <span>
          Revision
          <span class="global-hash">{utils.formatObjectId(revisionId)}</span>
        </span>
      </div>
      <div class="revision-data">
        {utils.formatTimestamp(revisionTimestamp)}
        {#if loading}
          <Loading small />
        {/if}
        {#if response?.diff.stats}
          {@const { insertions, deletions } = response.diff.stats}
          <DiffStatBadge {insertions} {deletions} />
        {/if}
        {#if previousRevOid}
          <Link
            title="Compare {utils.formatObjectId(
              previousRevOid,
            )}..{utils.formatObjectId(revisionOid)}"
            route={{
              resource: "project.patch",
              project: projectId,
              node: baseUrl,
              patch: patchId,
              view: {
                name: "diff",
                fromCommit: previousRevOid,
                toCommit: revisionOid,
              },
            }}>
            <IconButton>
              <IconSmall name="diff" />
            </IconButton>
          </Link>
        {:else}
          <Link
            title="Compare {utils.formatObjectId(
              projectHead,
            )}..{utils.formatObjectId(revisionOid)}"
            route={{
              resource: "project.patch",
              project: projectId,
              node: baseUrl,
              patch: patchId,
              view: {
                name: "diff",
                fromCommit: projectHead,
                toCommit: revisionOid,
              },
            }}>
            <IconButton>
              <IconSmall name="diff" />
            </IconButton>
          </Link>
        {/if}
        <Popover
          popoverPadding="0"
          popoverPositionTop="2.5rem"
          popoverPositionRight="0"
          popoverBorderRadius="var(--border-radius-small)">
          <IconButton slot="toggle" title="toggle-context-menu">
            <IconSmall name="more" />
          </IconButton>
          <DropdownList
            slot="popover"
            items={previousRevOid && previousRevId
              ? [projectHead, previousRevOid]
              : [projectHead]}>
            <Link
              let:item
              slot="item"
              title="{item}..{revisionOid}"
              route={{
                resource: "project.patch",
                project: projectId,
                node: baseUrl,
                patch: patchId,
                view: {
                  name: "diff",
                  fromCommit: item,
                  toCommit: revisionOid,
                },
              }}>
              {#if item === projectHead}
                <DropdownListItem selected={false}>
                  <span class="compare-dropdown-item">
                    Compare to {projectDefaultBranch}:
                    <span
                      style:color="var(--color-fill-secondary)"
                      style:font-weight="var(--font-weight-bold)"
                      style:font-family="var(--font-family-monospace)">
                      {utils.formatObjectId(projectHead)}
                    </span>
                  </span>
                </DropdownListItem>
              {:else if previousRevId}
                <DropdownListItem selected={false}>
                  <span class="compare-dropdown-item">
                    Compare to previous revision: <span
                      style:color="var(--color-fill-secondary)"
                      style:font-weight="var(--font-weight-bold)"
                      style:font-family="var(--font-family-monospace)">
                      {utils.formatObjectId(previousRevId)}
                    </span>
                  </span>
                </DropdownListItem>
              {/if}
            </Link>
          </DropdownList>
        </Popover>
      </div>
    </div>
    {#if expanded}
      <div>
        <div class="patch-header">
          <div
            class="authorship-header"
            style:border-top="1px solid var(--color-fill-separator)">
            <div style:color={badgeColor(patchState)}>
              <IconSmall name="patch" />
            </div>

            <NodeId nodeId={revisionAuthor.id} alias={revisionAuthor.alias}>
            </NodeId>

            {#if patchId === revisionId}
              opened this patch
            {:else}
              updated to <span class="global-hash">
                {utils.formatObjectId(revisionId)}
              </span>
            {/if}

            <div
              class="timestamp"
              title={utils.absoluteTimestamp(revisionTimestamp)}>
              {utils.formatTimestamp(revisionTimestamp)}
            </div>
          </div>
          {#if revisionDescription && !first}
            <div class="revision-description txt-small">
              <Markdown
                rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
                content={revisionDescription} />
            </div>
          {/if}
        </div>
        {#if loading}
          <div style:height="3.5rem">
            <Loading small />
          </div>
        {/if}
        {#if response?.commits}
          <CobCommitListing commits={response.commits} {baseUrl} {projectId} />
        {/if}
      </div>
      {#if error}
        <div
          class="diff-error txt-monospace txt-small"
          style:border-radius="var(--border-radius-small">
          <ErrorMessage
            message="Failed to load diff for this revision"
            {error} />
        </div>
      {/if}
    {/if}
  </div>
  {#if expanded}
    {#if timelines.length > 0}
      {#each timelines as element}
        {#if element.type === "thread"}
          <div class="connector" />
          <Thread
            enableAttachments
            rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
            thread={element.inner}
            on:editComment
            on:react
            on:reply />
        {:else if element.type === "merge"}
          <div class="connector" />
          <div class="action merge">
            <div class="authorship-header">
              <div style:color="var(--color-fill-primary)">
                <IconSmall name="patch" />
              </div>

              <NodeId
                nodeId={element.inner.author.id}
                alias={element.inner.author.alias}>
              </NodeId>

              merged revision
              <span class="global-hash">
                {utils.formatObjectId(element.inner.revision)}
              </span>
              at commit
              <span class="global-hash">
                {utils.formatCommit(element.inner.commit)}
              </span>

              <div
                class="timestamp"
                title={utils.absoluteTimestamp(revisionTimestamp)}>
                {utils.formatTimestamp(revisionTimestamp)}
              </div>
            </div>
          </div>
        {:else if element.type === "review"}
          {@const [author, review] = element.inner}
          <div class="connector" />
          <div
            class="action"
            class:comment-review={review.verdict === null}
            class:positive-review={review.verdict === "accept"}
            class:negative-review={review.verdict === "reject"}>
            <!-- TODO: Empty array for reactions prop is a workaround
                  until review comments have reactions -->
            <CommentComponent
              caption={formatVerdict(review.verdict)}
              authorId={author}
              authorAlias={review.author.alias}
              reactions={[]}
              timestamp={review.timestamp}
              rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
              body={review.summary ?? ""}
              on:react>
              <div slot="icon" style:color={verdictIconColor(review.verdict)}>
                {#if review.verdict === "accept"}
                  <IconSmall name="checkmark" />
                {:else if review.verdict === "reject"}
                  <IconSmall name="cross" />
                {:else}
                  <IconSmall name="chat" />
                {/if}
              </div>
            </CommentComponent>
          </div>
        {/if}
      {/each}
    {/if}
    <slot />
  {/if}
</div>
