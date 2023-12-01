<script lang="ts">
  import type { WeeklyActivity } from "@app/lib/commit";

  import capitalize from "lodash/capitalize";
  import { formatCommit, twemoji } from "@app/lib/utils";

  import ActivityDiagram from "@app/components/ActivityDiagram.svelte";
  import Badge from "@app/components/Badge.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";

  export let activity: WeeklyActivity[];
  export let compact = false;
  export let description: string;
  export let head: string;
  export let visibility: "public" | "private" = "public";
  export let id: string;
  export let name: string;
</script>

<style>
  .project {
    position: relative;
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
    display: flex;
    flex-direction: column;
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
  .compact .activity {
    position: absolute;
    bottom: 0;
  }
  .project:hover {
    box-shadow: 0 0 0 2px var(--color-border-focus);
  }
  .description {
    font-size: var(--font-size-small);
  }
  .title {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-medium);
  }
  .name {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
  .rid {
    visibility: hidden;
    color: var(--color-fill-secondary);
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
    .left {
      width: 100%;
    }
  }
</style>

<div class="project" class:compact>
  <div class="left">
    <div class="text">
      <div class="title">
        <span class="name" title={name}>
          {name}
        </span>
        {#if visibility === "private"}
          {#if compact}
            <div title="Private" style:color="var(--color-foreground-yellow)">
              <IconSmall name="lock" />
            </div>
          {:else}
            <Badge variant="yellowOutline" size="tiny">
              {capitalize(visibility)}
            </Badge>
          {/if}
        {/if}
      </div>
      <div class="description" use:twemoji>{description}</div>
      <div class="global-hash">
        {#if compact}
          {formatCommit(head)}
        {:else}
          {head}
        {/if}
      </div>
    </div>

    {#if compact}
      <div class="activity">
        <ActivityDiagram
          {id}
          {activity}
          viewBoxHeight={70}
          styleColor={visibility === "private"
            ? "var(--color-foreground-yellow)"
            : "var(--color-foreground-primary)"} />
      </div>
    {/if}
  </div>

  {#if !compact}
    <div class="right">
      <div class="id">
        <span class="rid layout-desktop">{id}</span>
      </div>
      <div class="layout-desktop activity">
        <ActivityDiagram
          {id}
          {activity}
          viewBoxHeight={100}
          styleColor={visibility === "private"
            ? "var(--color-foreground-yellow)"
            : "var(--color-foreground-primary)"} />
      </div>
    </div>
  {/if}
</div>
