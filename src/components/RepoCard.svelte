<script lang="ts">
  import type { RepoInfo } from "./RepoCard";

  import {
    absoluteTimestamp,
    formatTimestamp,
    formatRepositoryId,
    twemoji,
  } from "@app/lib/utils";

  import ActivityDiagram from "@app/components/ActivityDiagram.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";

  export let compact = false;
  export let repoInfo: RepoInfo;

  $: repo = repoInfo.repo;
  $: project = repoInfo.repo.payloads["xyz.radicle.project"];
  $: baseUrl = repoInfo.baseUrl;
  $: isPrivate = repo.visibility.type === "private";
</script>

<style>
  .repo-card {
    height: 10rem;
    border: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-small);
    background-color: var(--color-background-float);
    padding: 0.75rem 1rem;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  .repo-card.compact {
    height: 8rem;
  }

  .repo-card:hover {
    background-color: var(--color-fill-float-hover);
  }

  .activity {
    position: absolute;
    bottom: 1.5rem;
    right: 0;
    width: calc(100% - 3rem);
    max-width: 24rem;
  }

  .activity > .fadeout-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      var(--color-background-float) 20%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .repo-card:hover .fadeout-overlay {
    background: linear-gradient(
      to right,
      var(--color-fill-float-hover) 20%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    position: relative;
  }

  .title * {
    line-clamp: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .title p {
    color: var(--color-foreground-dim);
  }

  .headline-and-badges {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .badges {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    padding: 0.25rem;
  }

  h4,
  p {
    margin: 0;
  }

  .stats-row {
    position: relative;
    display: flex;
    gap: 0.25rem;
    height: 1.5rem;
    align-items: center;
    white-space: nowrap;
  }
</style>

<Link
  route={{
    resource: "repo.source",
    repo: repo.rid,
    node: baseUrl,
  }}>
  <div class="repo-card" class:compact>
    <div class="activity">
      <div class="fadeout-overlay" />
      <ActivityDiagram
        id={repo.rid}
        viewBoxHeight={200}
        styleColor="var(--color-foreground-primary"
        activity={repoInfo.activity} />
    </div>
    <div class="title">
      <div class="headline-and-badges">
        <h4 use:twemoji>{project.data.name}</h4>
        <div class="badges">
          {#if isPrivate}
            <div
              title="Private"
              class="badge"
              style="background-color: var(--color-fill-private); color: var(--color-foreground-yellow)">
              <Icon name="lock" />
            </div>
          {/if}
          <slot name="delegate" />
          <Badge
            variant="neutral"
            size="tiny"
            style="padding: 0 0.372rem; gap: 0.125rem;">
            <Icon name="seedling" />
            {repoInfo.repo.seeding}
          </Badge>
        </div>
      </div>
      <p class="txt-small" use:twemoji>
        {project.data.description}
      </p>
    </div>
    <div>
      <div class="stats-row txt-tiny" style:color="var(--color-foreground-dim)">
        <Icon name="issue" />
        {project.meta.issues.open} ·
        <Icon name="patch" />
        <span
          style:overflow="hidden"
          style:text-overflow="ellipsis"
          title={absoluteTimestamp(repoInfo.lastCommit.commit.committer.time)}>
          {project.meta.patches.open} · Updated {formatTimestamp(
            repoInfo.lastCommit.commit.committer.time,
          )}
        </span>
        <span
          title={repo.rid}
          style:color="var(--color-foreground-emphasized)"
          style:margin-left="auto">
          {formatRepositoryId(repo.rid)}
        </span>
      </div>
    </div>
  </div>
</Link>
