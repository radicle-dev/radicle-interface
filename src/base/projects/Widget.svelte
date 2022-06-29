<script lang="ts">
  import type * as proj from '@app/project';
  import AnchorBadge from '@app/base/profiles/AnchorBadge.svelte';
  import Diagram from '@app/Diagram.svelte';
  import { groupCommitsByWeek } from '@app/commit';
  import { Project } from '@app/project';
  import type { Seed } from '@app/base/seeds/Seed';

  export let project: proj.ProjectInfo;
  export let seed: Seed;
  export let faded = false;
  export let anchor: proj.Anchor | null = null;

  const getTimestampOneYearAgo = () => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    return Math.floor(oneYearAgo.getTime() / 1000).toString();
  };

  const loadCommits = async () => {
    const commits = await Project.getCommits(project.urn, seed.api, {
      parent: project.head ?? null,
      since: getTimestampOneYearAgo(),
    });
    return groupCommitsByWeek(commits.headers);
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
    text-overflow: ellipsis;
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
  article:hover .anchor {
    display: block;
  }
  article:hover .activity {
    display: none !important;
  }
  article.project-faded:hover {
    border-color: var(--color-foreground-faded);
  }
  article .id {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  article .description {
    margin-bottom: 0.25rem;
    font-size: 0.75rem;
  }
  article .stateHash {
    color: var(--color-secondary);
    font-size: 0.75rem;
    min-height: 2rem;
    display: flex;
    align-items: center;
  }
  article .anchor-info {
    display: flex;
    align-items: center;
  }
  article .actions {
    margin-right: 1rem;
  }
  article .commit, article .actions {
    font-family: var(--font-family-monospace);
  }
  article.project-faded .anchor {
    color: var(--color-foreground-faded);
  }
  article .id, article .anchor {
    display: flex;
    justify-content: space-between;
  }
  article .id .urn {
    visibility: hidden;
    color: var(--color-foreground-faded);
    font-weight: normal;
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
  }
  article .anchor-badge {
    display: none;
  }
  article:hover .id .urn {
    visibility: visible;
  }
  article:hover .anchor-badge {
    display: block;
  }
  @media (max-width: 720px) {
    article {
      min-width: 0;
    }
  }
</style>

<article on:click class:project-faded={faded}>
  <div class="left">
    <div class="id">
      <span class="name">{project.name}</span>
    </div>
    <div class="description">{project.description || ""}</div>
    <div class="stateHash">
      <span class="commit">
        <slot name="stateHash">
          {#if project.head}
            {project.head}
          {:else}
            <span class="subtle">✗ No head</span>
          {/if}
        </slot>
      </span>
    </div>
  </div>
  <div class="right">
    <div class="id">
      <span class="urn desktop">{project.urn}</span>
    </div>
    <div class="anchor">
      <span class="anchor-info">
        <span class="actions">
          <slot name="actions">
          </slot>
        </span>
        <span class="anchor-badge">
          <slot name="anchor">
            {#if anchor && project.head}
              <AnchorBadge
                commit={project.head}
                head={project.head} noText noBg
                anchors={[anchor.anchor.stateHash]} />
            {/if}
          </slot>
        </span>
      </span>
    </div>
    {#await loadCommits() then points}
      <div class="desktop activity">
        <Diagram {points}
          strokeWidth={3}
          viewBoxHeight={100}
          viewBoxWidth={600}
        />
      </div>
    {/await}
  </div>
</article>
