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
  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownItem from "@app/components/Dropdown/DropdownItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Link from "@app/components/Link.svelte";
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
        return "--color-foreground-5";
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
  }
  .revision-box {
    border: 1px solid var(--color-foreground-3);
    border-radius: var(--border-radius-small);
  }
  .revision-header {
    height: 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    padding: 1rem;
    padding-right: 1.5rem;
  }
  .revision-name {
    display: flex;
    user-select: none;
  }
  .revision-data {
    gap: 0.5rem;
    display: flex;
    align-items: center;
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
          <span style:color="var(--color-foreground-6)">Revision</span>
          {utils.formatObjectId(revisionId)}
        </span>
        <Clipboard text={revisionId} small />
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
              resource: "projects",
              params: {
                id: projectId,
                baseUrl,
                view: {
                  resource: "patch",
                  params: {
                    patch: patchId,
                    search: `diff=${previousRevOid}..${revisionOid}`,
                  },
                },
              },
            }}>
            <Icon name="diff" />
          </Link>
        {/if}
        <Floating>
          <svelte:fragment slot="toggle">
            <Icon name="ellipsis" />
          </svelte:fragment>
          <svelte:fragment slot="modal">
            <Dropdown
              items={previousRevOid && previousRevId
                ? [projectHead, previousRevOid]
                : [projectHead]}>
              <svelte:fragment slot="item" let:item>
                <Link
                  title="{item}..{revisionOid}"
                  route={{
                    resource: "projects",
                    params: {
                      id: projectId,
                      baseUrl,
                      view: {
                        resource: "patch",
                        params: {
                          patch: patchId,
                          search: `diff=${item}..${revisionOid}`,
                        },
                      },
                    },
                  }}>
                  {#if item === projectHead}
                    <DropdownItem selected={false} size="small">
                      Compare to {projectDefaultBranch} ({utils.formatObjectId(
                        projectHead,
                      )})
                    </DropdownItem>
                  {:else if previousRevId}
                    <DropdownItem selected={false} size="small">
                      Compare to previous revision ({utils.formatObjectId(
                        previousRevId,
                      )})
                    </DropdownItem>
                  {/if}
                </Link>
              </svelte:fragment>
            </Dropdown>
          </svelte:fragment>
        </Floating>
      </div>
    </div>
    {#if expanded}
      {@const caption =
        patchId === revisionId
          ? "opened this patch"
          : `updated to ${utils.formatObjectId(revisionId)}`}
      <div style:margin="0 1rem 1rem 2.5rem">
        {#if revisionDescription && !first}
          <div class="revision-description txt-small">
            <Markdown
              {baseUrl}
              {projectId}
              rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
              content={revisionDescription} />
          </div>
        {/if}
        <div class="txt-tiny">
          <Authorship
            authorId={revisionAuthor.id}
            authorAlias={revisionAuthor.alias}
            timestamp={revisionTimestamp}>
            {caption}
          </Authorship>
          {#if response?.commits}
            <div class="commits txt-tiny">
              {#each response.commits as commit, i}
                <div class="commit-event">
                  <span>
                    <span class="commit-pointer">╰─</span>
                    <span class="commit-separator">
                      {i === 0 ? "╎" : "│"}
                    </span>
                    <Avatar inline nodeId={revisionAuthor.id} />
                    <Link
                      route={{
                        resource: "projects",
                        params: {
                          id: projectId,
                          baseUrl,
                          view: { resource: "commits", commitId: commit.id },
                        },
                      }}>
                      <div class="commit-summary" use:twemoji>
                        <InlineMarkdown
                          content={commit.summary}
                          fontSize="tiny" />
                      </div>
                    </Link>
                  </span>
                  <span>
                    {utils.formatCommit(commit.id)}
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
              {baseUrl}
              {projectId}
              rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
              thread={element.inner}
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
            {#if review.comment}
              <div
                class="action"
                class:comment-review={review.verdict === null}
                class:positive-review={review.verdict === "accept"}
                class:negative-review={review.verdict === "reject"}>
                <CommentComponent
                  {baseUrl}
                  {projectId}
                  caption={formatVerdict(review.verdict)}
                  authorId={author}
                  authorAlias={review.author.alias}
                  authorAliasColor={aliasColorForVerdict(review.verdict)}
                  timestamp={review.timestamp}
                  rawPath={utils.getRawBasePath(
                    projectId,
                    baseUrl,
                    projectHead,
                  )}
                  body={review.comment} />
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
