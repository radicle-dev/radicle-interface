<script lang="ts">
  import type { BaseUrl, DiffResponse } from "@httpd-client";
  import type { Timeline } from "@app/views/projects/Patch.svelte";

  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { onMount } from "svelte";
  import { twemoji } from "@app/lib/utils";

  import Authorship from "@app/components/Authorship.svelte";
  import Avatar from "@app/components/Avatar.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import CommentComponent from "@app/components/Comment.svelte";
  import DiffStatBadge from "@app/components/DiffStatBadge.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import ModalToggle from "@app/components/ModalToggle.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Thread from "@app/components/Thread.svelte";

  export let baseUrl: BaseUrl;
  export let expanded: boolean = true;
  export let patchId: string;
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

  function formatVerdict(verdict?: string | null) {
    switch (verdict) {
      case "accept":
        return "accepted revision";
      case "reject":
        return "rejected revision";
      default:
        return "left a review";
    }
  }

  function aliasColorForVerdict(verdict?: string | null) {
    switch (verdict) {
      case "accept":
        return "--color-positive-5";
      case "reject":
        return "--color-negative-5";
      default:
        return "--color-fill-gray";
    }
  }

  let response: DiffResponse | undefined = undefined;
  let error: any | undefined = undefined;

  onMount(async () => {
    try {
      response = await api.project.getDiff(
        projectId,
        revisionBase,
        revisionOid,
      );
    } catch (err: any) {
      error = err;
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
    background-color: var(--color-primary-3);
    color: var(--color-primary-6);
  }
  .positive-review {
    color: var(--color-positive-6);
    background-color: var(--color-positive-3);
  }
  .comment-review {
    background-color: var(--color-foreground-1);
  }
  .negative-review {
    color: var(--color-negative-6);
    background-color: var(--color-negative-3);
  }
  .authorship-box {
    padding: 0.5rem 1rem;
  }

  .diff-error {
    margin: 1rem 1.5rem;
  }
  .revision {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
    border: 1px solid var(--color-border-hint);
    border-radius: var(--border-radius-small);
    background-color: var(--color-background-float);
    overflow: hidden;
  }
  .revision-box {
    border: 1px solid var(--color-foreground-3);
    border-radius: var(--border-radius-small);
  }
  .revision-header {
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    padding: 0.5rem;
    background-color: var(--color-background-default);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
  }
  .revision-name {
    display: flex;
    align-items: center;
  }
  .revision-data {
    gap: 0.75rem;
    display: flex;
    align-items: center;
    margin-left: auto;
  }
  .expand-button {
    margin-right: 0.5rem;
    user-select: none;
    cursor: pointer;
  }
  .revision-description {
    margin-bottom: 1rem;
  }
  .commits {
    margin-top: 0.5rem;
  }
  .hash {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-bold);
    color: var(--color-fill-secondary);
    font-size: var(--font-size-small);
  }
  .commit-event {
    color: var(--color-foreground-6);
    padding: 0.5rem 0.5rem 0.5rem 0.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-family: var(--font-family-monospace);
  }
  .commit-event:last-child {
    padding: 0.5rem 0.5rem 0 0.25rem;
  }
  .commit-event span {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
  .commit-pointer {
    color: var(--color-foreground-5);
    user-select: none;
  }
  .commit-separator {
    width: 0;
    height: 1rem;
    color: var(--color-foreground-5);
    position: relative;
    top: -1.15rem;
    left: -1.155rem;
    user-select: none;
  }
  .commit-summary:hover {
    text-decoration: underline;
  }
  .authorship-header {
    font-size: var(--font-size-small);
  }
</style>

<div class="revision">
  <div class="revision-box">
    <div class="revision-header">
      <div class="revision-name">
        <div class="expand-button">
          <Icon
            name={expanded ? "chevron-down" : "chevron-right"}
            on:click={() => (expanded = !expanded)} />
        </div>
        <span>
          Revision
          <span class="hash">{utils.formatObjectId(revisionId)}</span>
        </span>
        <span style:color="var(--color-fill-secondary)">
          <Clipboard text={revisionId} small />
        </span>
      </div>
      <div class="txt-small" />
      <div class="revision-data">
        <span class="layout-desktop txt-small">
          {utils.formatTimestamp(revisionTimestamp)}
        </span>
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
            <div style:color="var(--color-foreground-dim)">
              <Icon name="diff" />
            </div>
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
            <div style:color="var(--color-foreground-dim)">
              <Icon name="diff" />
            </div>
          </Link>
        {/if}
        <ModalToggle>
          <svelte:fragment slot="toggle">
            <div
              style:margin-right="0.25rem"
              style:color="var(--color-foreground-dim)">
              <IconSmall name="ellipsis" />
            </div>
          </svelte:fragment>
          <svelte:fragment slot="modal">
            <DropdownList
              items={previousRevOid && previousRevId
                ? [projectHead, previousRevOid]
                : [projectHead]}>
              <svelte:fragment slot="item" let:item>
                <Link
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
                      Compare to {projectDefaultBranch} ({utils.formatObjectId(
                        projectHead,
                      )})
                    </DropdownListItem>
                  {:else if previousRevId}
                    <DropdownListItem selected={false}>
                      Compare to previous revision ({utils.formatObjectId(
                        previousRevId,
                      )})
                    </DropdownListItem>
                  {/if}
                </Link>
              </svelte:fragment>
            </DropdownList>
          </svelte:fragment>
        </ModalToggle>
      </div>
    </div>
    {#if expanded}
      {@const caption =
        patchId === revisionId
          ? "opened this patch"
          : `updated to ${utils.formatObjectId(revisionId)}`}
      <div style:margin="1rem 1rem 1rem 2.5rem">
        {#if revisionDescription && !first}
          <div class="revision-description txt-small">
            <Markdown
              rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
              content={revisionDescription} />
          </div>
        {/if}
        <div class="authorship-header">
          <Authorship
            authorId={revisionAuthor.id}
            authorAlias={revisionAuthor.alias}
            timestamp={revisionTimestamp}>
            {caption}
          </Authorship>
          {#if response?.commits}
            <div class="commits txt-tiny">
              {#each response.commits.reverse() as commit, i}
                <div class="commit-event">
                  <span>
                    <span class="commit-pointer">╰─</span>
                    <span class="commit-separator">
                      {i === 0 ? "╎" : "│"}
                    </span>
                    <Avatar inline nodeId={revisionAuthor.id} />
                    <Link
                      route={{
                        resource: "project.commit",
                        project: projectId,
                        node: baseUrl,
                        commit: commit.id,
                      }}>
                      <div class="commit-summary" use:twemoji>
                        <InlineMarkdown
                          content={commit.summary}
                          fontSize="small" />
                      </div>
                    </Link>
                  </span>
                  <span>
                    <span class="hash">
                      {utils.formatCommit(commit.id)}
                    </span>
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      {#if error}
        <div
          class="diff-error txt-monospace txt-small"
          style:border-radius="var(--border-radius-small">
          <ErrorMessage
            message="Failed to load diff for this revision."
            stackTrace={error.stack.toString()} />
        </div>
      {/if}
    {/if}
  </div>
  {#if expanded}
    {#if timelines.length > 0}
      {#each timelines as element}
        <div style:margin-left="1.5rem">
          {#if element.type === "thread"}
            <Thread
              rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
              thread={element.inner}
              on:react
              on:reply />
          {:else if element.type === "merge"}
            <div
              class="action merge layout-desktop txt-tiny"
              style:padding="1rem">
              <Authorship
                authorId={element.inner.author.id}
                authorAlias={element.inner.author.alias}
                timestamp={element.timestamp}
                authorAliasColor="--color-primary-5">
                merged
                {utils.formatCommit(element.inner.commit)}
              </Authorship>
            </div>
            <div class="action merge layout-mobile txt-tiny">
              <Authorship
                authorId={element.inner.author.id}
                authorAlias={element.inner.author.alias}
                authorAliasColor="--color-primary-5">
                merged
                {utils.formatCommit(element.inner.commit)}
              </Authorship>
            </div>
          {:else if element.type === "review"}
            {@const [author, review] = element.inner}
            {#if review.summary}
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
                  authorAliasColor={aliasColorForVerdict(review.verdict)}
                  reactions={[]}
                  timestamp={review.timestamp}
                  rawPath={utils.getRawBasePath(
                    projectId,
                    baseUrl,
                    projectHead,
                  )}
                  body={review.summary}
                  on:react />
              </div>
            {:else}
              <div
                class="action layout-desktop-flex txt-tiny"
                class:comment-review={review.verdict === null}
                class:positive-review={review.verdict === "accept"}
                class:negative-review={review.verdict === "reject"}>
                <div class="authorship-box">
                  <Authorship
                    authorId={author}
                    authorAlias={review.author.alias}
                    authorAliasColor={aliasColorForVerdict(review.verdict)}
                    timestamp={element.timestamp}>
                    {formatVerdict(review.verdict)}
                  </Authorship>
                </div>
              </div>
              <div
                class="action layout-mobile-flex txt-tiny"
                class:comment-review={review.verdict === null}
                class:positive-review={review.verdict === "accept"}
                class:negative-review={review.verdict === "reject"}>
                <div class="authorship-box">
                  <Authorship
                    authorId={author}
                    authorAlias={review.author.alias}
                    authorAliasColor={aliasColorForVerdict(review.verdict)}>
                    {formatVerdict(review.verdict)}
                  </Authorship>
                </div>
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    {/if}
  {/if}
</div>
