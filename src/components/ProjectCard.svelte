<script lang="ts">
  import type { WeeklyActivity } from "@app/lib/commit";

  import { formatCommit, twemoji } from "@app/lib/utils";

  import ActivityDiagram from "@app/components/ActivityDiagram.svelte";

  export let activity: WeeklyActivity[];
  export let compact = false;
  export let description: string;
  export let head: string;
  export let id: string;
  export let name: string;
</script>

<style>
  .project {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem;
    box-shadow: 0 0 0 1px var(--color-border-hint);
    border-radius: var(--border-radius-small);
    min-width: 36rem;
    cursor: pointer;
    background: var(--color-background-float);
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
    margin-top: 0.5rem;
  }
  .project:hover {
    box-shadow: 0 0 0 2px var(--color-border-focus);
  }
  .description {
    font-size: var(--font-size-small);
  }
  .stateHash {
    color: var(--color-foreground-emphasized-hover);
    font-size: var(--font-size-small);
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-bold);
    display: flex;
    align-items: center;
  }
  .id {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-semibold);
  }
  .rid {
    visibility: hidden;
    color: var(--color-fill-secondary);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
  }
  .project:hover .rid {
    visibility: visible;
  }
  .text {
    display: flex;
    gap: 0.25rem;
    flex-direction: column;
  }
  @media (max-width: 720px) {
    .project {
      min-width: 0;
    }
  }
</style>

<div class="project" class:compact>
  <div class="left">
    <div class="text">
      <div class="id">{name}</div>
      <div class="description" use:twemoji>{description}</div>
      <div class="stateHash">
        {#if compact}
          {formatCommit(head)}
        {:else}
          {head}
        {/if}
      </div>
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
