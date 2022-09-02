<script lang="ts">
  import type * as proj from "@app/project";
  import Diagram from "@app/Diagram.svelte";
  import { groupCommitsByWeek } from "@app/commit";
  import type { Host } from "@app/api";
  import { Project } from "@app/project";
  import { formatCommit } from "@app/utils";

  export let project: proj.ProjectInfo;
  export let seed: { api: Host };
  export let faded = false;
  export let compact = false;

  const loadCommits = async () => {
    const commits = await Project.getActivity(project.urn, seed.api);

    return groupCommitsByWeek(commits.activity);
  };
</script>

<style>
  article {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem;
    border: 1px solid var(--color-secondary-faded);
    border-radius: var(--border-radius-small);
    min-width: 36rem;
    cursor: pointer;
  }
  article .right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
  }
  article .left {
    width: 50%;
  }
  div .description {
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
  }
  article.compact {
    min-width: 16rem;
    height: 8rem;
  }
  article.compact .left {
    width: 100%;
  }
  article.compact .right {
    display: none;
  }
  article.compact .description {
    white-space: nowrap;
  }
  article.project-faded {
    border: 1px dashed var(--color-foreground-subtle);
    cursor: not-allowed;
  }
  .activity {
    width: 100%;
    max-width: 14rem;
  }
  article:hover {
    border-color: var(--color-secondary);
  }
  article:hover .activity {
    display: none !important;
  }
  article.project-faded:hover {
    border-color: var(--color-foreground-faded);
  }
  article .id {
    font-size: var(--font-size-regular);
    font-weight: var(--font-weight-medium);
    margin-bottom: 0.5rem;
  }
  article .description {
    margin-bottom: 0.25rem;
    font-size: var(--font-size-tiny);
  }
  article .stateHash {
    color: var(--color-secondary);
    font-size: var(--font-size-tiny);
    min-height: 2rem;
    display: flex;
    align-items: center;
  }
  article .commit {
    font-family: var(--font-family-monospace);
  }
  article .id {
    display: flex;
    justify-content: space-between;
  }
  article .id .urn {
    visibility: hidden;
    color: var(--color-foreground-faded);
    font-weight: var(--font-weight-normal);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
  }
  article:hover .id .urn {
    visibility: visible;
  }
  @media (max-width: 720px) {
    article {
      min-width: 0;
    }
  }
</style>

<article on:click class:project-faded={faded} class:compact>
  <div class="left">
    <div class="id">
      <span class="name">{project.name}</span>
    </div>
    <div class="description">{project.description || ""}</div>
    <div class="stateHash">
      <span class="commit">
        <slot name="stateHash">
          {#if project.head}
            {#if compact}
              {formatCommit(project.head)}
            {:else}
              {project.head}
            {/if}
          {:else}
            <span class="txt-missing">✗ No head</span>
          {/if}
        </slot>
      </span>
    </div>
  </div>

  {#if !compact}
    <div class="right">
      <div class="id">
        <span class="urn desktop">{project.urn}</span>
      </div>
      {#await loadCommits() then points}
        <div class="desktop activity">
          <Diagram
            {points}
            strokeWidth={3}
            viewBoxHeight={100}
            viewBoxWidth={600} />
        </div>
      {/await}
    </div>
  {/if}
</article>
