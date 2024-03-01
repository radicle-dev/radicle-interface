<script lang="ts">
  import { formatTimestamp, twemoji } from "@app/lib/utils";

  import ActivityDiagram from "@app/components/ActivityDiagram.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";

  import type { ProjectInfo } from "./ProjectCard";

  export let compact = false;

  export let projectInfo: ProjectInfo;

  export let isDelegate: boolean;
  export let isSeeding: boolean;

  $: project = projectInfo.project;
  $: baseUrl = projectInfo.baseUrl;
  $: isPrivate = project.visibility?.type === "private";
  $: lastUpdated = formatTimestamp(
    projectInfo.lastCommit.commit.committer.time,
  );
</script>

<style>
  .project-card {
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

  .project-card.compact {
    height: 8rem;
  }

  .project-card:hover {
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

  .project-card:hover .fadeout-overlay {
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
    resource: "project.source",
    project: project.id,
    node: baseUrl,
  }}>
  <div class="project-card" class:compact>
    <div class="activity">
      <div class="fadeout-overlay" />
      <ActivityDiagram
        id={project.id}
        viewBoxHeight={200}
        styleColor="var(--color-foreground-primary"
        activity={projectInfo.activity} />
    </div>
    <div class="title">
      <div class="headline-and-badges">
        <h4 use:twemoji>{project.name}</h4>
        <div class="badges">
          {#if isPrivate}
            <div
              title="Private"
              class="badge"
              style="background-color: var(--color-fill-private); color: var(--color-foreground-yellow)">
              <IconSmall name="lock" />
            </div>
          {/if}
          {#if isDelegate}
            <div
              title="Delegate"
              class="badge"
              style="background-color: var(--color-fill-delegate); color: var(--color-foreground-primary)">
              <IconSmall name="badge" />
            </div>
          {/if}
          {#if isSeeding}
            <div
              title="Seeding"
              class="badge"
              style="background-color: var(--color-fill-counter-emphasized); color: var(--color-foreground-emphasized)">
              <IconSmall name="network" />
            </div>
          {/if}
        </div>
      </div>
      <p class="txt-small" use:twemoji>{project.description}</p>
    </div>
    <div class="stats-row txt-tiny" style:color="var(--color-foreground-dim)">
      <IconSmall name="issue" />
      {project.issues.open} ·
      <IconSmall name="patch" />
      <span style:overflow="hidden" style:text-overflow="ellipsis">
        {project.patches.open} · Updated {lastUpdated}
      </span>
    </div>
  </div>
</Link>
