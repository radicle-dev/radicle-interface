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
  import ProjectLink from "@app/components/ProjectLink.svelte";
  import Thread from "@app/components/Thread.svelte";

  export let authorId: string;
  export let authorAlias: string | undefined = undefined;
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
  export let timelines: Timeline[];
  export let previousRevId: string | undefined = undefined;
  export let previousRevOid: string | undefined = undefined;
  export let first: boolean;

  const api = new HttpdClient(baseUrl);

  function formatVerdict(revision: string, verdict?: string | null) {
    switch (verdict) {
      case "accept":
        return `accepted revision ${utils.formatObjectId(revision)}`;
      case "reject":
        return `rejected revision ${utils.formatObjectId(revision)}`;
      default:
        return `left a comment on revision ${utils.formatObjectId(revision)}`;
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
    padding: 1rem;
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius);
  }
  .action-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .merge {
    color: var(--color-primary-6);
    background-color: var(--color-primary-3);
  }
  .review {
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius);
    margin-left: 1rem;
  }
  .positive-review {
    color: var(--color-positive-6);
    background-color: var(--color-positive-3);
    border-radius: var(--border-radius);
  }
  .negative-review {
    color: var(--color-negative-6);
    background-color: var(--color-negative-3);
    border-radius: var(--border-radius);
  }
  .revision {
    border: 1px solid var(--color-foreground-3);
    border-radius: var(--border-radius-small);
    margin-bottom: 1rem;
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
  .revision-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius-small);
  }
  .expand-button {
    margin-right: 0.5rem;
    user-select: none;
    cursor: pointer;
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
        <ProjectLink
          title="Compare {utils.formatObjectId(
            previousRevOid,
          )}..{utils.formatObjectId(revisionOid)}"
          projectParams={{
            search: `diff=${previousRevOid}..${revisionOid}`,
          }}>
          <Icon name="diff" />
        </ProjectLink>
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
              <ProjectLink
                title="{item}..{revisionOid}"
                projectParams={{
                  search: `diff=${item}..${revisionOid}`,
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
              </ProjectLink>
            </svelte:fragment>
          </Dropdown>
        </svelte:fragment>
      </Floating>
    </div>
  </div>
  {#if expanded}
    <div class="revision-body">
      {#each timelines as element}
        {#if element.type === "thread"}
          <div class="review">
            <Thread
              rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
              thread={element.inner}
              on:reply />
          </div>
        {:else if element.type === "revision"}
          {@const caption =
            patchId === element.inner.id
              ? "opened this patch"
              : `updated to ${utils.formatObjectId(element.inner.id)}`}
          {#if element.inner.description && !first}
            <div class="txt-small">
              <Markdown
                rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
                content={element.inner.description} />
            </div>
          {/if}
          <div class="action txt-tiny">
            <Authorship {authorId} {authorAlias} timestamp={element.timestamp}>
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
                      <Avatar inline nodeId={authorId} />
                      <ProjectLink
                        projectParams={{
                          view: { resource: "commits" },
                          revision: commit.id,
                          search: undefined,
                        }}>
                        <div class="commit-summary" use:twemoji>
                          <InlineMarkdown
                            content={commit.summary}
                            fontSize="tiny" />
                        </div>
                      </ProjectLink>
                    </span>
                    <span>
                      {utils.formatCommit(commit.id)}
                    </span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
          {#if error}
            <div class="txt-monospace">
              <ErrorMessage
                message="Failed to load diff for this revision."
                stackTrace={error.stack.toString()} />
            </div>
          {/if}
        {:else if element.type === "merge"}
          <div class="action merge layout-desktop txt-tiny">
            <div class="action-content">
              <Authorship
                authorId={element.inner.author.id}
                authorAlias={element.inner.author.alias}
                timestamp={element.timestamp}
                authorAliasColor="--color-primary-5">
                merged
                {utils.formatCommit(element.inner.commit)}
              </Authorship>
            </div>
          </div>
          <div class="action merge layout-mobile txt-tiny">
            <div class="action-content">
              <Authorship
                authorId={element.inner.author.id}
                authorAlias={element.inner.author.alias}
                authorAliasColor="--color-primary-5">
                merged
                {utils.formatCommit(element.inner.commit)}
              </Authorship>
            </div>
          </div>
        {:else if element.type === "review"}
          {@const [revisionId, author, review] = element.inner}
          {#if review.comment}
            <div
              class="review"
              class:positive-review={element.inner[2].verdict === "accept"}
              class:negative-review={element.inner[2].verdict === "reject"}>
              <CommentComponent
                caption={formatVerdict(revisionId, review.verdict)}
                authorId={author}
                authorAlias={review.author.alias}
                timestamp={review.timestamp}
                rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)}
                body={review.comment} />
            </div>
          {:else}
            <div
              class="action layout-desktop txt-tiny"
              class:positive-review={element.inner[2].verdict === "accept"}
              class:negative-review={element.inner[2].verdict === "reject"}>
              <div class="action-content">
                <Authorship
                  authorId={author}
                  authorAlias={review.author.alias}
                  authorAliasColor={aliasColorForVerdict(review.verdict)}
                  timestamp={element.timestamp}>
                  {formatVerdict(revisionId, review.verdict)}
                </Authorship>
              </div>
            </div>
            <div
              class="layout-mobile txt-tiny"
              class:positive-review={element.inner[2].verdict === "accept"}
              class:negative-review={element.inner[2].verdict === "reject"}>
              <div class="action-content">
                <Authorship
                  authorId={author}
                  authorAlias={review.author.alias}
                  authorAliasColor={aliasColorForVerdict(review.verdict)}>
                  {formatVerdict(revisionId, review.verdict)}
                </Authorship>
              </div>
            </div>
          {/if}
        {/if}
      {/each}
    </div>
  {/if}
</div>
