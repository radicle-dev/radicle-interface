<script lang="ts">
  import type { WeeklyActivity } from "@app/lib/commit";

  import { formatCommit, twemoji } from "@app/lib/utils";

  import ActivityDiagram from "@app/views/projects/ActivityDiagram.svelte";

  export let compact = false;
  export let description: string;
  export let head: string;
  export let id: string;
  export let name: string;

  export let activity: WeeklyActivity[];
</script>

<style>
  .project {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem;
    border: 1px solid var(--border-hint);
    min-width: 36rem;
    cursor: pointer;
    background: var(--background-float);
  }
  .right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
  }
  .left {
    width: 50%;
  }
  .description {
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
  }
  .compact {
    min-width: 16rem;
    height: 9rem;
  }
  .compact .left {
    width: 100%;
  }
  .compact .right {
    display: none;
  }
  .compact .description {
    white-space: nowrap;
  }
  .activity {
    width: 100%;
    max-width: 14rem;
  }
  .project:hover {
    border-color: var(--color-secondary);
    background-color: var(--color-secondary-1);
  }
  .description {
    margin-bottom: 0.25rem;
    font-size: var(--font-size-tiny);
  }
  .stateHash {
    color: var(--color-secondary);
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    min-height: 2rem;
    display: flex;
    align-items: center;
  }
  .id {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-regular);
    font-weight: var(--font-weight-medium);
    margin-bottom: 0.5rem;
  }
  .rid {
    visibility: hidden;
    color: var(--color-foreground-5);
    font-weight: var(--font-weight-normal);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
  }
  .project:hover .rid {
    visibility: visible;
  }
  @media (max-width: 720px) {
    .project {
      min-width: 0;
    }
  }
</style>

<div class="project" class:compact>
  <div class="left">
    <div class="id">
      <span class="name">{name}</span>
    </div>
    <div class="description" use:twemoji>{description}</div>
    <div class="stateHash">
      {#if compact}
        {formatCommit(head)}
      {:else}
        {head}
      {/if}
    </div>
    {#if compact}
      <div class="activity">
        <ActivityDiagram {activity} viewBoxHeight={70} />
      </div>
    {/if}
  </div>

  {#if !compact}
    <div class="right">
      <div class="id">
        <span class="rid layout-desktop">{id}</span>
      </div>
      <div class="layout-desktop activity">
        <ActivityDiagram {activity} viewBoxHeight={100} />
      </div>
    </div>
  {/if}
</div>
